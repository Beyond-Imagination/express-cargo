# Resumen de decoradores

## ¿Qué son los decoradores?
Los decoradores en express-cargo anotan campos de clase para indicarle al middleware:

- De dónde extraer los datos (por ejemplo, body o query)
- Cómo validarlos
- Cómo transformarlos

Cuando pasas una clase a `bindingCargo`, el middleware lee estos decoradores para construir, validar y transformar un objeto con seguridad de tipos que recuperas con `getCargo`.

## Categorías de decoradores

Los decoradores se agrupan según el rol que cumplen en la canalización de enlace.

| Categoría         | Propósito                                                      | Ejemplos                                                                                        | Referencia                                                                                             |
|-------------------|----------------------------------------------------------------|-------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| **Source**        | Elige de dónde proviene el valor de un campo                   | `@Body`, `@Query`, `@Header`, `@Uri` / `@Params`, `@Session`, `@UploadedFile`, `@UploadedFiles` | [Decoradores de origen](./source-decorators.md), [Decoradores de subida de archivos](./file-upload.md) |
| **Request**       | Lee un valor directamente del `Request` de Express             | `@Request`                                                                                      | [Decoradores de campo virtual](./virtual.md)                                                           |
| **Virtual**       | Calcula un campo a partir de los demás campos del objeto       | `@Virtual`                                                                                      | [Decoradores de campo virtual](./virtual.md)                                                           |
| **Transform**     | Modifica el valor de un solo campo antes del enlace            | `@Transform`                                                                                    | [Decorador de transformación](./transforms.md)                                                         |
| **Type helper**   | Decide cómo se interpreta y se convierte un valor sin procesar | `@Type`, `@List`, `@Enum`                                                                       | [Decoradores de ayuda de tipo](./type-helpers.md)                                                      |
| **Validation**    | Aplica reglas al valor de un campo                             | `@Min`, `@Max`, `@Email`, `@OneOf`, …                                                           | [Decoradores de validación](./validators.md)                                                           |
| **Missing-value** | Decide qué ocurre cuando un campo está ausente                 | `@Default`, `@Optional`                                                                         | [Manejo de campos faltantes](./missing-fields.md)                                                      |

**Source**, **Request** y **Virtual** responden a la misma pregunta —¿de dónde viene el valor de este campo?—, así que cada campo debe llevar exactamente uno de ellos y no pueden mezclarse. `@UploadedFile` y `@UploadedFiles` son decoradores de origen que leen la salida del analizador multipart, por eso `@UploadedFile` y `@Body` en un mismo campo se rechazan igual que `@Body` y `@Query`.

Para los escenarios más avanzados de `@Type` y `@List` —polimorfismo, referencias circulares, arrays de clases propias— consulta [Transformación de tipos y polimorfismo](../advanced/type-and-polymorphism.md) y [Decorador List](../advanced/list-decorator.md) en **Uso avanzado**.

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

La limitación se aplica dentro de cada categoría, no entre categorías: un campo admite un origen, un ayudante de tipo y una estrategia de valor faltante, mientras que los decoradores de validación pueden apilarse libremente. `bindingCargo()` comprueba estas reglas al registrar la ruta y lanza `CargoSchemaError` antes de que el servidor atienda una solicitud.

Cada categoría se documenta en su propia página enlazada arriba.
