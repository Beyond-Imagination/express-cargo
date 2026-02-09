# Decorator de champ par défaut

Express-Cargo fournit des decorators pour définir des valeurs par défaut pour les champs de requête. Le decorator assigne automatiquement une valeur lorsque la requête entrante n'en fournit pas (undefined ou null).

## Decorator par défaut intégré

### `@Default(value: T)`

Le decorator @Default assigne une valeur par défaut à une propriété de classe lorsque la requête ne la fournit pas.

- **`value`** : La valeur par défaut à assigner si le champ n'est pas présent dans la requête.

```typescript
class Request {
    @Body()
    @Default(1)
    price!: number;
}
```
