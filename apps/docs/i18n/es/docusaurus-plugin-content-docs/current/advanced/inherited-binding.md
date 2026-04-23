## Enlace heredado

Los decoradores de campo también se aplican a los campos declarados en clases padre.  
Esto te permite definir campos comunes en una **clase base** y luego extenderlos o sobrescribirlos en **clases hijas**.

### Ejemplo
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

### Resultado
`CreateUserRequest` tendrá los siguientes campos:

- id: heredado de `BaseRequest`

- role: definido en `CreateUserRequest`
