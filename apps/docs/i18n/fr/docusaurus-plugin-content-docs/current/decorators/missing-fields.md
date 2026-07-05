# Gestion des champs manquants

Lorsqu'un champ est **manquant dans la requête** (sa valeur est `undefined` ou `null`), Express-Cargo doit savoir quoi faire. Deux décorateurs contrôlent ce comportement :

- **`@Default(value)`** — substitue une valeur de repli.
- **`@Optional()`** — permet au champ de rester vide sans déclencher d'erreur « required ».

Comme les deux décident de la même chose — ce qui se passe lorsqu'un champ est manquant — ils sont **mutuellement exclusifs**. Appliquer les deux au même champ déclenche une erreur de schéma.

Si un champ n'a **aucun** des deux décorateurs et que la valeur est manquante, la liaison échoue avec une erreur de validation `<field> is required`.

## `@Default(value: T)`

Le décorateur `@Default` assigne une valeur par défaut à une propriété de classe lorsque la requête ne la fournit pas.

- **`value`** : La valeur par défaut à assigner si le champ n'est pas présent dans la requête.

```typescript
class Request {
    @Body()
    @Default(1)
    price!: number;
}
```

### Quand la valeur par défaut est appliquée

La valeur par défaut est appliquée **uniquement lorsque la valeur entrante est `undefined` ou `null`** (c'est-à-dire que le champ est manquant dans la requête). Toute autre valeur provenant de la requête est conservée telle quelle.

Cela signifie que les valeurs falsy telles que `0`, `''` et `false` sont traitées comme une véritable entrée et **ne déclenchent pas** la valeur par défaut :

```typescript
class Request {
    @Body()
    @Default(10)
    quantity!: number
}
```

| `quantity` entrant   | Valeur liée                |
|----------------------|----------------------------|
| manquant / `undefined` | `10` (défaut appliqué)   |
| `null`               | `10` (défaut appliqué)     |
| `0`                  | `0` (conservé)             |
| `5`                  | `5` (conservé)             |

## `@Optional()`

Le décorateur `@Optional` marque un champ comme optionnel, lui permettant d'être omis ou défini sur `undefined`/`null` sans déclencher d'erreur « required ». Lorsque le champ est manquant, il est laissé à `null` et les règles de validation du champ sont ignorées.

```typescript
class Request {
    @Body()
    @Min(0)
    @Optional()
    discount?: number
}
```

Ici, un `discount` manquant est lié à `null` et la règle `@Min(0)` est ignorée. Si `discount` **est** fourni, il est validé normalement.

## Choisir entre `@Default` et `@Optional`

| | Champ manquant | Champ fourni |
|---|---|---|
| `@Default(value)` | lié à `value` | valeur conservée et validée |
| `@Optional()` | lié à `null` | valeur conservée et validée |
| aucun | erreur `<field> is required` | valeur conservée et validée |

Choisissez **une seule** stratégie par champ :

```typescript
class Request {
    // ❌ Invalide : un champ ne peut utiliser qu'une seule stratégie de valeur manquante
    @Body()
    @Default(1)
    @Optional()
    price!: number
}
```
