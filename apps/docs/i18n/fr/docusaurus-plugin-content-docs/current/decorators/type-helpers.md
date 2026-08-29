# Décorateurs d'aide au typage

Les aides au typage indiquent au lieur **comment interpréter la valeur d'un champ** avant l'exécution de la validation. Elles déterminent en quelle classe un objet imbriqué est converti, vers quel type chaque élément d'un tableau est converti et sur quel membre d'énumération une chaîne brute est mappée.

`@Type`, `@List` et `@Enum` forment une seule catégorie. Un champ ne peut en recevoir qu'un seul au maximum.

## `@Type(typeFn: TypeThunk | TypeResolver, options?: TypeOptions)`

Convertit un objet JSON brut en une instance de la classe cible.

- **`typeFn`** : Une fonction qui retourne la classe cible. Utilisez un thunk `() => Class` pour un type fixe, ou un résolveur `(data) => Class` pour choisir la classe à partir des données brutes.
- **`options.discriminator`** (optionnel) : Mappage structurel de la forme `{ property, subTypes: [{ name, value }] }`. La classe est sélectionnée selon la valeur de `property`.

`@Type` ne peut pas être appliqué à un champ `String`, `Number` ou `Boolean`.

```typescript
class User {
    @Body()
    @Type(() => Profile)
    profile!: Profile
}
```

Voir [Transformation de types et polymorphisme](../advanced/type-and-polymorphism.md) pour le mappage imbriqué, les références circulaires et la résolution dynamique.

## `@List(elementType: ArrayElementType)`

Déclare le type des éléments d'un champ tableau afin que chaque élément soit converti individuellement.

- **`elementType`** : `String`, `Number`, `Boolean`, `Date`, un constructeur de classe, ou l'un des littéraux de chaîne `'string'`, `'number'`, `'boolean'`, `'date'`.

`@List` ne peut être appliqué qu'à des champs de type tableau.

```typescript
class ListSample {
    @Body()
    @List(Number)
    scores!: number[]
}
```

Voir [Décorateur List](../advanced/list-decorator.md) pour un exemple complet.

## `@Enum(enumObj: object, message?: string)`

Mappe la valeur entrante sur un membre de `enumObj` et rejette une valeur qui n'en est pas membre.

- **`enumObj`** : L'objet enum sur lequel la valeur est mappée.
- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la valeur n'est pas membre. S'il est omis, un message par défaut sera utilisé.

La clé de l'énumération (`'ADMIN'`) comme sa valeur (`'admin'`, `0`) sont acceptées en entrée, et le champ lié contient toujours la valeur de l'énumération. Une chaîne numérique est comparée numériquement : `'0'` correspond donc au membre dont la valeur est `0`.

```typescript
enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

class UpdateRoleRequest {
    @Body('role')
    @Enum(UserRole)
    role!: UserRole
}
```

`@Enum` convertit et vérifie la valeur, mais c'est une **aide au typage**, pas un [décorateur de validation](./validators.md). Deux conséquences en découlent :

- `@Each` n'encapsule que des décorateurs de validation, donc `@Each(Enum(UserRole))` est rejeté.
- `@Enum` installe son propre transformateur et ne peut donc pas être combiné avec `@Transform`.

## Règles de schéma

`bindingCargo()` vérifie les règles ci-dessous lors de l'enregistrement de la route, et non à la première requête. Une violation lève `CargoSchemaError` au démarrage.

| Règle                                             | Message de violation                                                           |
|---------------------------------------------------|--------------------------------------------------------------------------------|
| Une seule aide au typage par champ                | `@List + @Type cannot be combined; apply a single one of @Type/@List/@Enum`    |
| `@List` exige un champ de type tableau            | `@List can only be applied to array fields`                                    |
| `@Type` refuse un champ primitif                  | `@Type cannot be applied to a primitive field`                                 |
| `@Each` ne peut pas encapsuler une aide au typage | `@Each cannot wrap type-helper decorator(s): @Enum`                            |
| `@Enum` possède son transformateur                | `@Enum cannot be combined with @Transform; @Enum installs its own transformer` |

Un message nomme les décorateurs réellement appliqués, dans l'ordre d'évaluation (de bas en haut) : le début du message dépend donc de votre code.
