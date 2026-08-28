# Decoradores de ayuda de tipo

Los ayudantes de tipo le indican al enlazador **cómo interpretar el valor de un campo** antes de que se ejecute la validación. Deciden en qué clase se convierte un objeto anidado, a qué tipo se convierte cada elemento de un array y a qué miembro de un enum se asigna una cadena sin procesar.

`@Type`, `@List` y `@Enum` forman una sola categoría. A un campo se le puede aplicar como máximo uno de ellos.

## `@Type(typeFn: TypeThunk | TypeResolver, options?: TypeOptions)`

Convierte un objeto JSON plano en una instancia de la clase de destino.

- **`typeFn`**: Una función que devuelve la clase de destino. Usa un thunk `() => Class` para un tipo fijo, o un resolutor `(data) => Class` para elegir la clase a partir de los datos sin procesar.
- **`options.discriminator`** (opcional): Asignación estructural con la forma `{ property, subTypes: [{ name, value }] }`. La clase se selecciona según el valor de `property`.

`@Type` no puede aplicarse a un campo `String`, `Number` o `Boolean`.

```typescript
class User {
    @Body()
    @Type(() => Profile)
    profile!: Profile
}
```

Consulta [Transformación de tipos y polimorfismo](../advanced/type-and-polymorphism.md) para mapeo anidado, referencias circulares y resolución dinámica.

## `@List(elementType: ArrayElementType)`

Declara el tipo de los elementos de un campo de array para que cada elemento se convierta individualmente.

- **`elementType`**: `String`, `Number`, `Boolean`, `Date`, un constructor de clase, o uno de los literales de cadena `'string'`, `'number'`, `'boolean'`, `'date'`.

`@List` solo puede aplicarse a campos de array.

```typescript
class ListSample {
    @Body()
    @List(Number)
    scores!: number[]
}
```

Consulta [Decorador List](../advanced/list-decorator.md) para ver un ejemplo completo.

## `@Enum(enumObj: object, message?: string)`

Asigna el valor entrante a un miembro de `enumObj` y rechaza un valor que no sea miembro.

- **`enumObj`**: El objeto enum al que se asigna el valor.
- **`message`** (opcional): El mensaje de error que se mostrará cuando el valor no sea miembro. Si se omite, se usará un mensaje predeterminado.

Se aceptan como entrada tanto la clave del enum (`'ADMIN'`) como su valor (`'admin'`, `0`), y el campo enlazado siempre contiene el valor del enum. Una cadena numérica se compara numéricamente, así que `'0'` coincide con el miembro cuyo valor es `0`.

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

`@Enum` convierte y comprueba el valor, pero es un **ayudante de tipo**, no un [decorador de validación](./validators.md). De ahí se derivan dos consecuencias:

- `@Each` solo envuelve decoradores de validación, por lo que `@Each(Enum(UserRole))` se rechaza.
- `@Enum` instala su propio transformador, así que no puede combinarse con `@Transform`.

## Reglas de esquema

`bindingCargo()` comprueba las reglas siguientes al registrar la ruta, no en la primera solicitud. Una infracción lanza `CargoSchemaError` en el arranque.

| Regla                                         | Mensaje de infracción                                                          |
|-----------------------------------------------|--------------------------------------------------------------------------------|
| Solo un ayudante de tipo por campo            | `@List + @Type cannot be combined; apply a single one of @Type/@List/@Enum`    |
| `@List` requiere un campo de array            | `@List can only be applied to array fields`                                    |
| `@Type` rechaza un campo primitivo            | `@Type cannot be applied to a primitive field`                                 |
| `@Each` no puede envolver un ayudante de tipo | `@Each cannot wrap type-helper decorator(s): @Enum`                            |
| `@Enum` es dueño del transformador            | `@Enum cannot be combined with @Transform; @Enum installs its own transformer` |

Un mensaje nombra los decoradores que realmente aplicaste, en orden de evaluación (de abajo hacia arriba), así que la parte inicial varía según tu código.
