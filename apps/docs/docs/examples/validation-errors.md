# Error Handling

When validation fails, `bindingCargo` throws a `CargoValidationError`. You can handle this error using either `setCargoErrorHandler` or Express's built-in error handling middleware.

---

## Error Types

### `CargoValidationError`

Thrown when one or more fields fail validation.

| Property | Type | Description |
|---|---|---|
| `name` | `string` | Always `'CargoValidationError'` |
| `errors` | `CargoFieldError[]` | List of field-level errors |

### `CargoFieldError`

Represents a single field validation failure.

| Property | Type | Description |
|---|---|---|
| `name` | `string` | Always `'CargoFieldError'` |
| `field` | `string \| symbol` | The name of the field that failed |
| `message` | `string` | The error message |

---

## Option 1: `setCargoErrorHandler` (Recommended)

Register a global handler once at app startup. All validation errors across every route will be handled automatically.

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

**Example response:**
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

## Option 2: Express Error Middleware

Use Express's standard 4-argument error middleware to catch `CargoValidationError`.

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

> **Note:** If `setCargoErrorHandler` is registered, it takes priority. The Express error middleware will only receive the error if `next(err)` is called inside `setCargoErrorHandler`.

---

## Handling Multiple Errors

A single request can fail multiple validations at once. All errors are collected and returned together.

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

If both fields are invalid, `err.errors` will contain two entries:

```json
{
    "error": "Validation failed",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```
