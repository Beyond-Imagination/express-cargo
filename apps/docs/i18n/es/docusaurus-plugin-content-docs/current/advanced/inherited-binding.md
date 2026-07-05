# Enlace heredado

Los decoradores de campo también se aplican a los campos declarados en clases padre.  
Esto te permite definir campos comunes una vez en una **clase base** y reutilizarlos en las **clases hijas**.

## Ejemplo
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

## Resultado
`CreateUserRequest` tendrá los siguientes campos:

- id: heredado de `BaseRequest`

- role: definido en `CreateUserRequest`

Cuando pasas `CreateUserRequest` a `bindingCargo`, tanto el `id` heredado como el `role` declarado localmente se enlazan y validan juntos.

## Volver a declarar un campo heredado

Volver a declarar un campo heredado en una clase hija **no** reemplaza la definición de la clase padre: los decoradores de ambas clases se combinan en el mismo campo. Volver a aplicar un decorador de origen de esta forma (por ejemplo, `@Body()` en un campo que la clase padre ya obtiene con `@Body()`) produce un error de esquema:

```
Update.id: @body + @body cannot be combined; pick a single source
```

Por lo tanto, cada campo debe declararse en una sola clase. Para cambiar cómo se enlaza o valida un campo, edítalo donde se declaró originalmente en lugar de volver a declararlo en una subclase.

## Notas

- Los campos se recopilan a lo largo de toda la cadena de prototipos, por lo que se admiten varios niveles de herencia.
