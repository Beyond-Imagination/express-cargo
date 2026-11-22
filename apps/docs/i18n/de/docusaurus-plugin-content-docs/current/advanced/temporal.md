---
id: temporal
title: Temporal
---

Ab Node.js 26 bindet express-cargo Anfragewerte an die integrierten [`Temporal`](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Temporal)-Typen, und die Datums-Validatoren akzeptieren sie. `Date`-Felder funktionieren weiterhin mit jeder unterstützten Node.js-Version.

## Voraussetzungen

| Laufzeitumgebung | `Date` | `Temporal` |
|---|---|---|
| Node.js 20, 22, 24 | Unterstützt | Nicht unterstützt |
| Node.js 24 mit `--harmony-temporal` | Unterstützt | Nicht unterstützt (experimentelles Flag) |
| Node.js 26 oder höher | Unterstützt | Unterstützt |

- Unterstützt wird nur das in Node.js integrierte `Temporal`. Ein Polyfill wie `@js-temporal/polyfill` wird nicht unterstützt.
- Unter Node.js 24 aktiviert `--harmony-temporal` ein experimentelles `Temporal`, express-cargo behandelt diese Laufzeit aber als nicht unterstützt.
- In einer Laufzeitumgebung ohne Unterstützung löst ein DTO, das ein Temporal-Feld, `@List('plainDate')`, `@Type(() => Temporal.X)`, `@MinDuration` oder `@MaxDuration` deklariert, beim Aufruf von `bindingCargo()` einen `CargoSchemaError` aus, sodass die App beim Start abbricht.
- TypeScript liefert ab Version 6.0 Temporal-Typen mit. Binden Sie sie in der `tsconfig.json` mit `"lib": ["ESNext"]` (oder `"esnext.temporal"`) ein.

## Unterstützte Typen

| Typ | String-Beispiel | Objekt im Body | Durch `@MinDate` / `@MaxDate` geordnet | `@List`-Name |
|---|---|---|---|---|
| `Temporal.Instant` | `2026-01-01T00:00:00Z` | Nein | Ja | `'instant'` |
| `Temporal.ZonedDateTime` | `2026-01-01T09:00+09:00[Asia/Seoul]` | Ja | Ja | `'zonedDateTime'` |
| `Temporal.PlainDateTime` | `2026-01-01T09:00` | Ja | Ja | `'plainDateTime'` |
| `Temporal.PlainDate` | `2026-01-01` | Ja | Ja | `'plainDate'` |
| `Temporal.PlainTime` | `09:00` | Ja | Ja | `'plainTime'` |
| `Temporal.PlainYearMonth` | `2026-01` | Ja | Ja | `'plainYearMonth'` |
| `Temporal.PlainMonthDay` | `01-01` | Ja | Nein | `'plainMonthDay'` |
| `Temporal.Duration` | `PT1H30M` | Ja | `@MinDuration` / `@MaxDuration` verwenden | `'duration'` |

## Beispiel

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

Diese Anfrage bindet jedes Feld:

```json
{
    "checkIn": "2027-03-01",
    "length": { "hours": 2 },
    "holidays": ["2027-05-05"],
    "cancelAt": "2027-02-28T18:00+09:00[Asia/Seoul]"
}
```

`booking.checkIn` ist ein `Temporal.PlainDate`, `booking.length` ist die `Temporal.Duration` `PT2H`, und `booking.trial` ist der Standardwert `P7D` als `Temporal.Duration`.

## Wie Werte gelesen werden

- **Strings** aus jeder Quelle (Body, Query, Params, Header) werden mit `Temporal.X.from()` geparst. Plain-Typen (`PlainDate`, `PlainDateTime` usw.) akzeptieren einen String mit UTC-Offset und verwerfen den Offset, wie es Temporal tut, sodass `2026-01-01T09:00+09:00` an das `PlainDate` `2026-01-01` gebunden wird. Ein String mit `Z` am Ende wird für sie abgelehnt.
- **Objekte** wie `{ "year": 2026, "month": 3, "day": 1 }` werden nur aus dem Request-Body gelesen, und zwar mit `overflow: 'reject'`, sodass `{ "month": 2, "day": 30 }` fehlschlägt, statt zum 2. März zu werden. `Instant` hat keine Objektform.
- **Kalender**: Nur der ISO-8601-Kalender wird gebunden. Ein Wert wie `2026-01-01[u-ca=hebrew]` oder `{ "calendar": "hebrew", ... }` schlägt fehl.
- **Instanzen** desselben Typs bleiben unverändert. Zahlen, Arrays und andere Temporal-Typen schlagen fehl.
- Ein Wert, der nicht gelesen werden kann, schlägt mit `<field> must be a valid <Type>` fehl, zum Beispiel `checkIn must be a valid PlainDate`.
- `@Default`-Werte werden wie Anfragewerte gecastet, sodass `@Default('P7D')` eine `Temporal.Duration` ergibt. Ein Listen-Standardwert erhält bei jeder Anfrage ein neues Array.

## Nullable-Felder benötigen `@Type`

TypeScript erfasst eine Union wie `Temporal.PlainDate | null` als `Object`, sodass express-cargo den Temporal-Typ nicht erkennen kann. Fügen Sie `@Type(() => Temporal.X)` hinzu:

```typescript
class Request {
    @Body()
    @Optional()
    @Type(() => Temporal.PlainDate)
    dueDate!: Temporal.PlainDate | null
}
```

Dasselbe gilt für einen Typalias. Ein Temporal-Validator auf einem solchen Feld ohne `@Type` oder innerhalb von `@Each` ohne `@List` löst beim Start einen `CargoSchemaError` aus, da der Wert ein String bliebe und bei jeder Anfrage fehlschlüge.

## Validatoren

### `@MinDate` und `@MaxDate`

Die Grenze muss denselben Typ wie das Feld haben, zum Beispiel ein `Temporal.PlainDate` bei einem `PlainDate`-Feld, oder eine Funktion, die einen solchen Wert zurückgibt:

```typescript
@Body()
@MinDate(Temporal.PlainTime.from('09:00'))
@MaxDate(Temporal.PlainTime.from('18:00'))
startsAt!: Temporal.PlainTime
```

- Die Standardmeldung lautet `startsAt must be on or after 09:00:00`.
- Eine feste Grenze eines anderen Typs, zum Beispiel eine `PlainDateTime`-Grenze bei einem `PlainDate`-Feld, löst beim Start einen `CargoSchemaError` aus. Eine Funktionsgrenze, die einen anderen Typ zurückgibt, löst den Fehler erst bei der Validierung der Anfrage aus, worauf der Standard-Fehlerhandler von Express mit einem 500 antwortet.
- Sie können nicht für `PlainMonthDay`, das keine Ordnung hat, und nicht für `Duration` verwendet werden; verwenden Sie dort stattdessen `@MinDuration` / `@MaxDuration`.

### `@MinDuration` und `@MaxDuration`

Sie prüfen ein `Temporal.Duration`-Feld gegen eine Grenze, die als `Temporal.Duration` oder als ISO-8601-String angegeben wird:

```typescript
@Body()
@MinDuration('PT0S')
@MaxDuration('P1D')
timeout!: Temporal.Duration
```

- Ein Tag zählt als 24 Stunden, sodass `P1D` gleich `PT24H` ist.
- Jahre, Monate und Wochen haben keine feste Länge, daher löst eine Grenze wie `P1M` beim Start einen `CargoSchemaError` aus. Ein Wert in diesen Einheiten schlägt mit `<field> must be given in days or smaller units, such as P7D, not in years, months or weeks` fehl.
- Durations können negativ sein. Ein Feld mit nur `@MaxDuration` akzeptiert `-PT1H`; fügen Sie `@MinDuration('PT0S')` hinzu, um das abzulehnen.

### `@Equal`, `@NotEqual` und `@OneOf`

`Date`-Werte werden nach ihrer Zeit und Temporal-Werte mit dem `equals()` von Temporal verglichen, sodass zwei `PlainDate`-Werte für denselben Tag gleich sind:

```typescript
@Body()
@OneOf([Temporal.PlainTime.from('09:00'), Temporal.PlainTime.from('15:00')])
slot!: Temporal.PlainTime
```

- Ein Wert eines anderen Typs löst beim Start einen `CargoSchemaError` aus, zum Beispiel `@Equal('2026-11')` bei einer `PlainYearMonth`; verwenden Sie `Temporal.PlainYearMonth.from('2026-11')`.
- `ZonedDateTime`-Werte sind nur gleich, wenn auch die Zeitzone übereinstimmt, sodass sich `2026-01-01T09:00+09:00[Asia/Seoul]` und `2026-01-01T00:00Z[UTC]` unterscheiden.
- `Duration`-Werte sind nur gleich, wenn jede Einheit übereinstimmt, sodass sich `PT60M` und `PT1H` unterscheiden.

## Wissenswertes

- **`+` in einem Query-String** wird zu einem Leerzeichen. Senden Sie einen Offset als `%2B09:00`.
- **Sommerzeit**: Eine lokale Zeit, die in einer `ZonedDateTime` nicht existiert oder doppelt vorkommt, wird wie bei Temporals `disambiguation: 'compatible'` ohne Fehler aufgelöst.
- **Schaltsekunden**: `23:59:60` wird als `23:59:59` gelesen.
- **`@Transform`**: Ein Feld mit `@Transform` erhält den Wert, den die Transformation zurückgibt. Wenn die Transformation ein Element aus einem wiederholten Query-Schlüssel auswählt, wird dieses Element nicht gecastet.
- **Session-Werte** durchlaufen denselben Cast wie Werte aus anderen Quellen: Ein String wird gebunden, während ein aus einem JSON-Session-Store zurückgelesenes Objekt fehlschlägt.
