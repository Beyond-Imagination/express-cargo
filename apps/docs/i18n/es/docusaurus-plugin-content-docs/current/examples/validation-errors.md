# Manejo de errores

Cuando la validación falla, `bindingCargo` lanza un `CargoValidationError`. Puedes manejar este error usando `setCargoErrorHandler` o el middleware de manejo de errores integrado de Express.

---

## Tipos de error

### `CargoValidationError`

Se lanza cuando uno o más campos fallan la validación.

| Propiedad | Tipo | Descripción |
|---|---|---|
| `name` | `string` | Siempre `'CargoValidationError'` |
| `errors` | `CargoFieldError[]` | Lista de errores a nivel de campo |

### `CargoFieldError`

Representa un único fallo de validación de campo.

| Propiedad | Tipo | Descripción |
|---|---|---|
| `name` | `string` | Siempre `'CargoFieldError'` |
| `field` | `string \| symbol` | El nombre del campo que falló |
| `message` | `string` | El mensaje de error |

---

## Opción 1: `setCargoErrorHandler` (recomendado)

Registra un manejador global una vez al iniciar la aplicación. Todos los errores de validación de todas las rutas se manejarán automáticamente.

```typescript
import { setCargoErrorHandler, CargoValidationError } from 'express-cargo'

setCargoErrorHandler((err, req, res, next) => {
    res.status(400).json({
        error: 'Validation failed',
        details: err.errors.map(e => ({
            field: e.field,
            message: e.message,
        })),
    })
})
```

**Respuesta de ejemplo:**
```json
{
    "error": "Validation failed",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```

---

## Opción 2: middleware de errores de Express

Usa el middleware de errores estándar de Express con 4 argumentos para capturar `CargoValidationError`.

```typescript
import { CargoValidationError } from 'express-cargo'
import { Request, Response, NextFunction } from 'express'

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.errors.map(e => ({
                field: e.field,
                message: e.message,
            })),
        })
    }
    next(err)
})
```

> **Nota:** Si `setCargoErrorHandler` está registrado, tiene prioridad. El middleware de errores de Express solo recibirá el error si se llama a `next(err)` dentro de `setCargoErrorHandler`.

---

## Manejo de múltiples errores

Una sola solicitud puede fallar varias validaciones a la vez. Todos los errores se recopilan y se devuelven juntos.

```typescript
class CreateUserDto {
    @Body()
    @Email()
    email!: string

    @Body()
    @Min(0)
    age!: number
}
```

Si ambos campos son inválidos, `err.errors` contendrá dos entradas:

```json
{
    "error": "Validation failed",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```
