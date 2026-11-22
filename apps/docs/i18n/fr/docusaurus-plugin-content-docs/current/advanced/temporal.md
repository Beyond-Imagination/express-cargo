---
id: temporal
title: Temporal
---

Sur Node.js 26 ou supérieur, express-cargo lie les valeurs de la requête aux types intégrés [`Temporal`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Temporal), et les validateurs de dates les acceptent. Les champs `Date` continuent de fonctionner sur toutes les versions de Node.js prises en charge.

## Prérequis

| Environnement | `Date` | `Temporal` |
|---|---|---|
| Node.js 20, 22, 24 | Pris en charge | Non pris en charge |
| Node.js 24 avec `--harmony-temporal` | Pris en charge | Non pris en charge (option expérimentale) |
| Node.js 26 ou supérieur | Pris en charge | Pris en charge |

- Seul le `Temporal` intégré à Node.js est pris en charge. Un polyfill tel que `@js-temporal/polyfill` ne l'est pas.
- Sous Node.js 24, `--harmony-temporal` active un `Temporal` expérimental, mais express-cargo considère cet environnement comme non pris en charge.
- Sur un environnement sans prise en charge, un DTO qui déclare un champ Temporal, `@List('plainDate')`, `@Type(() => Temporal.X)`, `@MinDuration` ou `@MaxDuration` lève une `CargoSchemaError` lors de l'appel de `bindingCargo()` : l'application s'arrête donc au démarrage.
- TypeScript fournit les types Temporal à partir de la version 6.0. Incluez-les avec `"lib": ["ESNext"]` (ou `"esnext.temporal"`) dans `tsconfig.json`.

## Types pris en charge

| Type | Exemple de chaîne | Objet dans le corps | Ordonné par `@MinDate` / `@MaxDate` | Nom pour `@List` |
|---|---|---|---|---|
| `Temporal.Instant` | `2026-01-01T00:00:00Z` | Non | Oui | `'instant'` |
| `Temporal.ZonedDateTime` | `2026-01-01T09:00+09:00[Asia/Seoul]` | Oui | Oui | `'zonedDateTime'` |
| `Temporal.PlainDateTime` | `2026-01-01T09:00` | Oui | Oui | `'plainDateTime'` |
| `Temporal.PlainDate` | `2026-01-01` | Oui | Oui | `'plainDate'` |
| `Temporal.PlainTime` | `09:00` | Oui | Oui | `'plainTime'` |
| `Temporal.PlainYearMonth` | `2026-01` | Oui | Oui | `'plainYearMonth'` |
| `Temporal.PlainMonthDay` | `01-01` | Oui | Non | `'plainMonthDay'` |
| `Temporal.Duration` | `PT1H30M` | Oui | Utilisez `@MinDuration` / `@MaxDuration` | `'duration'` |

## Exemple

```typescript
import express from 'express'
import { Body, bindingCargo, Default, Each, getCargo, List, MaxDate, MaxDuration, MinDate, MinDuration, Optional, Type } from 'express-cargo'

class BookingRequest {
    @Body()
    @MinDate(() => Temporal.Now.plainDateISO())
    checkIn!: Temporal.PlainDate

    @Body()
    @MinDuration('PT30M')
    @MaxDuration('PT4H')
    length!: Temporal.Duration

    @Body()
    @List('plainDate')
    @Each(MaxDate(Temporal.PlainDate.from('2027-12-31')))
    holidays!: Temporal.PlainDate[]

    @Body()
    @Optional()
    @Type(() => Temporal.ZonedDateTime)
    cancelAt!: Temporal.ZonedDateTime | null

    @Body()
    @Default('P7D')
    trial!: Temporal.Duration
}

const app = express()
app.use(express.json())

app.post('/bookings', bindingCargo(BookingRequest), (req, res) => {
    const booking = getCargo<BookingRequest>(req)
    const checkOut = booking.checkIn.add({ days: 2 })
    res.json({ checkIn: booking.checkIn, checkOut, length: booking.length, trial: booking.trial })
})
```

Cette requête lie tous les champs :

```json
{
    "checkIn": "2027-03-01",
    "length": { "hours": 2 },
    "holidays": ["2027-05-05"],
    "cancelAt": "2027-02-28T18:00+09:00[Asia/Seoul]"
}
```

`booking.checkIn` est un `Temporal.PlainDate`, `booking.length` est le `Temporal.Duration` `PT2H`, et `booking.trial` est la valeur par défaut `P7D` sous la forme d'un `Temporal.Duration`.

## Lecture des valeurs

- Les **chaînes**, quelle que soit leur source (corps, query, paramètres, en-têtes), sont analysées avec `Temporal.X.from()`. Les types Plain (`PlainDate`, `PlainDateTime`, etc.) acceptent une chaîne comportant un décalage UTC et suppriment ce décalage, comme le fait Temporal : `2026-01-01T09:00+09:00` est donc lié au `PlainDate` `2026-01-01`. Une chaîne se terminant par `Z` est rejetée pour ces types.
- Les **objets** tels que `{ "year": 2026, "month": 3, "day": 1 }` sont lus uniquement dans le corps de la requête, avec `overflow: 'reject'` : `{ "month": 2, "day": 30 }` échoue au lieu de devenir le 2 mars. `Instant` n'a pas de forme objet.
- **Calendriers** : seul le calendrier ISO 8601 est lié. Une valeur telle que `2026-01-01[u-ca=hebrew]` ou `{ "calendar": "hebrew", ... }` échoue.
- Les **instances** du même type sont conservées telles quelles. Les nombres, les tableaux et les autres types Temporal échouent.
- Une valeur qui ne peut pas être lue échoue avec `<field> must be a valid <Type>`, par exemple `checkIn must be a valid PlainDate`.
- Les valeurs `@Default` sont converties comme les valeurs de la requête : `@Default('P7D')` donne donc un `Temporal.Duration`. Une valeur par défaut de liste reçoit un nouveau tableau à chaque requête.

## Les champs nullables nécessitent `@Type`

TypeScript enregistre une union telle que `Temporal.PlainDate | null` comme `Object` ; express-cargo ne peut donc pas voir le type Temporal. Ajoutez `@Type(() => Temporal.X)` :

```typescript
class Request {
    @Body()
    @Optional()
    @Type(() => Temporal.PlainDate)
    dueDate!: Temporal.PlainDate | null
}
```

Il en va de même pour un alias de type. Un validateur Temporal sur un tel champ sans `@Type`, ou dans `@Each` sans `@List`, lève une `CargoSchemaError` au démarrage, car la valeur resterait une chaîne et échouerait à chaque requête.

## Validateurs

### `@MinDate` et `@MaxDate`

La borne doit être du même type que le champ, comme un `Temporal.PlainDate` sur un champ `PlainDate`, ou une fonction qui en retourne un :

```typescript
@Body()
@MinDate(Temporal.PlainTime.from('09:00'))
@MaxDate(Temporal.PlainTime.from('18:00'))
startsAt!: Temporal.PlainTime
```

- Le message par défaut est `startsAt must be on or after 09:00:00`.
- Une borne fixe d'un autre type, comme une borne `PlainDateTime` sur un champ `PlainDate`, lève une `CargoSchemaError` au démarrage. Une borne fournie par une fonction qui retourne un autre type lève une erreur lors de la validation de la requête, ce que le gestionnaire d'erreurs par défaut d'Express traduit par une réponse 500.
- Ils ne peuvent pas être utilisés sur `PlainMonthDay`, qui n'a pas d'ordre, ni sur `Duration` ; utilisez plutôt `@MinDuration` / `@MaxDuration`.

### `@MinDuration` et `@MaxDuration`

Ils vérifient un champ `Temporal.Duration` par rapport à une borne donnée sous la forme d'un `Temporal.Duration` ou d'une chaîne ISO 8601 :

```typescript
@Body()
@MinDuration('PT0S')
@MaxDuration('P1D')
timeout!: Temporal.Duration
```

- Un jour compte pour 24 heures : `P1D` est donc égal à `PT24H`.
- Les années, les mois et les semaines n'ont pas de longueur fixe : une borne telle que `P1M` lève donc une `CargoSchemaError` au démarrage. Une valeur exprimée dans ces unités échoue avec `<field> must be given in days or smaller units, such as P7D, not in years, months or weeks`.
- Les durées peuvent être négatives. Un champ avec seulement `@MaxDuration` accepte `-PT1H` ; ajoutez `@MinDuration('PT0S')` pour le rejeter.

### `@Equal`, `@NotEqual` et `@OneOf`

Les `Date` sont comparées par leur instant et les valeurs Temporal avec `equals()` de Temporal : deux `PlainDate` pour le même jour sont donc égaux :

```typescript
@Body()
@OneOf([Temporal.PlainTime.from('09:00'), Temporal.PlainTime.from('15:00')])
slot!: Temporal.PlainTime
```

- Une valeur d'un autre type lève une `CargoSchemaError` au démarrage, comme `@Equal('2026-11')` sur un `PlainYearMonth` ; utilisez `Temporal.PlainYearMonth.from('2026-11')`.
- Les valeurs `ZonedDateTime` ne sont égales que si le fuseau horaire correspond aussi : `2026-01-01T09:00+09:00[Asia/Seoul]` et `2026-01-01T00:00Z[UTC]` diffèrent donc.
- Les valeurs `Duration` ne sont égales que si chaque unité correspond : `PT60M` et `PT1H` diffèrent donc.

## À savoir

- **`+` dans une chaîne de requête** devient une espace. Envoyez un décalage sous la forme `%2B09:00`.
- **Heure d'été** : une heure locale qui n'existe pas ou qui se produit deux fois dans un `ZonedDateTime` est résolue comme le fait `disambiguation: 'compatible'` de Temporal, sans erreur.
- **Secondes intercalaires** : `23:59:60` est lu comme `23:59:59`.
- **`@Transform`** : un champ avec `@Transform` reçoit la valeur retournée par la transformation. Si la transformation choisit un élément parmi une clé de query répétée, cet élément n'est pas converti.
- **Les valeurs de session** passent par la même conversion que les autres sources : une chaîne est liée, tandis qu'un objet relu depuis un stockage de session JSON échoue.
