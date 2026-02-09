## Liaison héritée

Les décorateurs de champ sont également appliqués aux champs déclarés dans les classes parentes.
Cela vous permet de définir des champs communs dans une **classe de base** puis de les étendre ou de les remplacer dans des **classes enfants**.

### Exemple
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

### Résultat
`CreateUserRequest` aura les champs suivants :

- id : hérité de `BaseRequest`

- role : défini dans `CreateUserRequest`
