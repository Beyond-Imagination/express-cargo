## Vererbte Bindung

Feld-Decorators werden auch auf Felder angewendet, die in übergeordneten Klassen deklariert sind.
Dies ermöglicht es Ihnen, gemeinsame Felder in einer **Basisklasse** zu definieren und diese dann in **Unterklassen** zu erweitern oder zu überschreiben.

### Beispiel
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

### Ergebnis
`CreateUserRequest` wird die folgenden Felder haben:

- id : von `BaseRequest` geerbt

- role : in `CreateUserRequest` definiert
```
