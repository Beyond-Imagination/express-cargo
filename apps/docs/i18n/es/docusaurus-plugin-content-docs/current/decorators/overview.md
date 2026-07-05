# Resumen de decoradores

## ¿Qué son los decoradores?
Los decoradores en express-cargo anotan campos de clase para indicarle al middleware:

- De dónde extraer los datos (por ejemplo, body o query)
- Cómo validarlos
- Cómo transformarlos

Cuando pasas una clase a `bindingCargo`, el middleware lee estos decoradores para construir, validar y transformar un objeto con seguridad de tipos que recuperas con `getCargo`.

## Categorías de decoradores

Los decoradores se agrupan según el rol que cumplen en la canalización de enlace.

| Categoría | Propósito | Ejemplos | Referencia |
|-----------|-----------|----------|------------|
| **Source** | Elige de dónde proviene el valor de un campo | `@Body`, `@Query`, `@Header`, `@Uri` / `@Params`, `@Session` | [Decoradores de origen](./source-decorators.md) |
| **Virtual** | Calcula un campo a partir de otros campos o del `Request` sin procesar | `@Virtual`, `@Request` | [Decoradores de campo virtual](./virtual.md) |
| **Transform** | Modifica el valor de un solo campo antes del enlace | `@Transform` | [Decorador de transformación](./transforms.md) |
| **Validation** | Aplica reglas al valor de un campo | `@Min`, `@Max`, `@Email`, `@OneOf`, … | [Decoradores de validación](./validators.md) |
| **Missing-value** | Decide qué ocurre cuando un campo está ausente | `@Default`, `@Optional` | [Manejo de campos faltantes](./missing-fields.md) |

Otros ayudantes se tratan en **Uso avanzado**, como [`@List`](../advanced/list-decorator.md) para arrays tipados y [`@Type`](../advanced/type-and-polymorphism.md) para tipos anidados y polimórficos.

## Combinar decoradores

Un solo campo puede llevar decoradores de varias categorías. Se leen en conjunto para enlazar, transformar y validar ese campo:

```typescript
import { Body, Transform, MinLength } from 'express-cargo'

class CreateUserRequest {
    @Body('email')                              // Source: lee de req.body.email
    @Transform((value: string) => value.trim()) // Transform: normaliza el valor
    @MinLength(5)                               // Validation: aplica una regla
    email!: string
}
```

Cada categoría se documenta en su propia página enlazada arriba.
