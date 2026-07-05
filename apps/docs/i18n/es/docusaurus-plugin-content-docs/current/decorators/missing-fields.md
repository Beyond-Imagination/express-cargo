# Manejo de campos faltantes

Cuando un campo **falta en la solicitud** (su valor es `undefined` o `null`), Express-Cargo necesita saber qué hacer. Dos decoradores controlan este comportamiento:

- **`@Default(value)`** — sustituye con un valor de reserva.
- **`@Optional()`** — permite que el campo quede vacío sin provocar un error «required».

Como ambos deciden lo mismo —qué ocurre cuando falta un campo— son **mutuamente excluyentes**. Aplicar los dos al mismo campo lanza un error de esquema.

Si un campo **no tiene ninguno** de los dos decoradores y el valor falta, el enlace falla con un error de validación `<field> is required`.

## `@Default(value: T)`

El decorador `@Default` asigna un valor predeterminado a una propiedad de clase cuando la solicitud no la proporciona.

- **`value`**: El valor predeterminado que se asignará si el campo no está presente en la solicitud.

```typescript
class Request {
    @Body()
    @Default(1)
    price!: number;
}
```

### Cuándo se aplica el valor predeterminado

El valor predeterminado se aplica **solo cuando el valor entrante es `undefined` o `null`** (es decir, el campo falta en la solicitud). Cualquier otro valor proveniente de la solicitud se mantiene tal cual.

Esto significa que los valores falsy como `0`, `''` y `false` se tratan como entrada real y **no** activan el valor predeterminado:

```typescript
class Request {
    @Body()
    @Default(10)
    quantity!: number
}
```

| `quantity` entrante  | Valor enlazado              |
|----------------------|-----------------------------|
| falta / `undefined`  | `10` (predeterminado aplicado) |
| `null`               | `10` (predeterminado aplicado) |
| `0`                  | `0` (mantenido)             |
| `5`                  | `5` (mantenido)             |

## `@Optional()`

El decorador `@Optional` marca un campo como opcional, permitiendo que se omita o se establezca como `undefined`/`null` sin provocar un error «required». Cuando el campo falta, se deja como `null` y se omiten las reglas de validación del campo.

```typescript
class Request {
    @Body()
    @Min(0)
    @Optional()
    discount?: number
}
```

Aquí un `discount` faltante se enlaza a `null` y se omite la regla `@Min(0)`. Si `discount` **sí** se proporciona, se valida normalmente.

## Elegir entre `@Default` y `@Optional`

| | Campo faltante | Campo proporcionado |
|---|---|---|
| `@Default(value)` | enlazado a `value` | valor mantenido y validado |
| `@Optional()` | enlazado a `null` | valor mantenido y validado |
| ninguno | error `<field> is required` | valor mantenido y validado |

Elige **una** estrategia por campo:

```typescript
class Request {
    // ❌ Inválido: un campo solo puede usar una estrategia de valor faltante
    @Body()
    @Default(1)
    @Optional()
    price!: number
}
```
