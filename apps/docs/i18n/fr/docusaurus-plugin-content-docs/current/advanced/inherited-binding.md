# Liaison héritée

Les décorateurs de champ sont également appliqués aux champs déclarés dans les classes parentes.  
Cela vous permet de définir des champs communs une seule fois dans une **classe de base** et de les réutiliser dans les **classes enfants**.

## Exemple
```typescript
class BaseRequest {
  @Body()
  @Length(10)
  id!: string
}

class CreateUserRequest extends BaseRequest {
  @Body()
  @OneOf(["admin", "user"])
  role!: string
}
```

## Résultat
`CreateUserRequest` aura les champs suivants :

- id : hérité de `BaseRequest`

- role : défini dans `CreateUserRequest`

Lorsque vous passez `CreateUserRequest` à `bindingCargo`, le `id` hérité et le `role` déclaré localement sont liés et validés ensemble.

## Redéclarer un champ hérité

Redéclarer un champ hérité dans une classe enfant ne remplace **pas** la définition de la classe parente — les décorateurs des deux classes sont fusionnés sur le même champ. Réappliquer un décorateur de source de cette manière (par exemple `@Body()` sur un champ que la classe parente source déjà avec `@Body()`) produit une erreur de schéma :

```
Update.id: @body + @body cannot be combined; pick a single source
```

Chaque champ doit donc être déclaré dans une seule classe. Pour modifier la façon dont un champ est lié ou validé, modifiez-le là où il est initialement déclaré plutôt que de le redéclarer dans une sous-classe.

## Remarques

- Les champs sont collectés sur toute la chaîne de prototypes, ce qui permet de prendre en charge plusieurs niveaux d'héritage.
