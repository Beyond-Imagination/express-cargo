# Aperçu des décorateurs

## Que sont les décorateurs ?
Les décorateurs dans express-cargo annotent les champs de classe pour indiquer au middleware :

- D'où extraire les données (par exemple, body, query)
- Comment les valider
- Comment les transformer

Lorsque vous passez une classe à `bindingCargo`, le middleware lit ces décorateurs pour construire, valider et transformer un objet typé que vous récupérez avec `getCargo`.

## Catégories de décorateurs

Les décorateurs sont regroupés selon le rôle qu'ils jouent dans le pipeline de liaison.

| Catégorie | Rôle | Exemples | Référence |
|-----------|------|----------|-----------|
| **Source** | Choisit d'où provient la valeur d'un champ | `@Body`, `@Query`, `@Header`, `@Uri` / `@Params`, `@Session` | [Décorateurs de source](./source-decorators.md) |
| **Virtual** | Calcule un champ à partir d'autres champs ou du `Request` brut | `@Virtual`, `@Request` | [Décorateurs de champ virtuel](./virtual.md) |
| **Transform** | Modifie la valeur d'un seul champ avant la liaison | `@Transform` | [Décorateur de transformation](./transforms.md) |
| **Validation** | Applique des règles à la valeur d'un champ | `@Min`, `@Max`, `@Email`, `@OneOf`, … | [Décorateurs de validation](./validators.md) |
| **Missing-value** | Décide ce qui se passe quand un champ est absent | `@Default`, `@Optional` | [Gestion des champs manquants](./missing-fields.md) |

D'autres utilitaires sont traités dans **Utilisation avancée**, comme [`@List`](../advanced/list-decorator.md) pour les tableaux typés et [`@Type`](../advanced/type-and-polymorphism.md) pour les types imbriqués et polymorphes.

## Combiner les décorateurs

Un seul champ peut porter des décorateurs de plusieurs catégories. Ils sont lus ensemble pour lier, transformer et valider ce champ :

```typescript
import { Body, Transform, MinLength } from 'express-cargo'

class CreateUserRequest {
    @Body('email')                              // Source : lit depuis req.body.email
    @Transform((value: string) => value.trim()) // Transform : normalise la valeur
    @MinLength(5)                               // Validation : applique une règle
    email!: string
}
```

Chaque catégorie est documentée sur sa propre page liée ci-dessus.
