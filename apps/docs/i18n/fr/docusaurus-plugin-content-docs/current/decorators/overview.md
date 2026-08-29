# Aperçu des décorateurs

## Que sont les décorateurs ?
Les décorateurs dans express-cargo annotent les champs de classe pour indiquer au middleware :

- D'où extraire les données (par exemple, body, query)
- Comment les valider
- Comment les transformer

Lorsque vous passez une classe à `bindingCargo`, le middleware lit ces décorateurs pour construire, valider et transformer un objet typé que vous récupérez avec `getCargo`.

## Catégories de décorateurs

Les décorateurs sont regroupés selon le rôle qu'ils jouent dans le pipeline de liaison.

| Catégorie         | Rôle                                                            | Exemples                                                                                        | Référence                                                                                                     |
|-------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| **Source**        | Choisit d'où provient la valeur d'un champ                      | `@Body`, `@Query`, `@Header`, `@Uri` / `@Params`, `@Session`, `@UploadedFile`, `@UploadedFiles` | [Décorateurs de source](./source-decorators.md), [Décorateurs de téléversement de fichiers](./file-upload.md) |
| **Request**       | Lit une valeur directement depuis le `Request` d'Express        | `@Request`                                                                                      | [Décorateurs de champ virtuel](./virtual.md)                                                                  |
| **Virtual**       | Calcule un champ à partir des autres champs de l'objet          | `@Virtual`                                                                                      | [Décorateurs de champ virtuel](./virtual.md)                                                                  |
| **Transform**     | Modifie la valeur d'un seul champ avant la liaison              | `@Transform`                                                                                    | [Décorateur de transformation](./transforms.md)                                                               |
| **Type helper**   | Détermine comment une valeur brute est interprétée et convertie | `@Type`, `@List`, `@Enum`                                                                       | [Décorateurs d'aide au typage](./type-helpers.md)                                                             |
| **Validation**    | Applique des règles à la valeur d'un champ                      | `@Min`, `@Max`, `@Email`, `@OneOf`, …                                                           | [Décorateurs de validation](./validators.md)                                                                  |
| **Missing-value** | Décide ce qui se passe quand un champ est absent                | `@Default`, `@Optional`                                                                         | [Gestion des champs manquants](./missing-fields.md)                                                           |

**Source**, **Request** et **Virtual** répondent à la même question — d'où vient la valeur de ce champ ? — chaque champ doit donc en porter exactement un, et ils ne peuvent pas être combinés. `@UploadedFile` et `@UploadedFiles` sont des décorateurs de source qui lisent la sortie de l'analyseur multipart : c'est pourquoi `@UploadedFile` et `@Body` sur un même champ sont rejetés comme le sont `@Body` et `@Query`.

Pour les scénarios plus poussés de `@Type` et `@List` — polymorphisme, références circulaires, tableaux de classes personnalisées — voir [Transformation de types et polymorphisme](../advanced/type-and-polymorphism.md) et [Décorateur List](../advanced/list-decorator.md) dans **Utilisation avancée**.

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

La limite s'applique au sein d'une catégorie, pas entre catégories : un champ prend une source, une aide au typage et une stratégie de valeur manquante, tandis que les décorateurs de validation peuvent être empilés librement. `bindingCargo()` vérifie ces règles lors de l'enregistrement de la route et lève `CargoSchemaError` avant que le serveur ne traite une requête.

Chaque catégorie est documentée sur sa propre page liée ci-dessus.
