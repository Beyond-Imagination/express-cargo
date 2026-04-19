# Fehlerbehandlung

Wenn die Validierung fehlschlägt, wirft `bindingCargo` einen `CargoValidationError`. Dieser Fehler kann mit `setCargoErrorHandler` oder der eingebauten Express-Fehlerbehandlungs-Middleware verarbeitet werden.

---

## Fehlertypen

### `CargoValidationError`

Wird ausgelöst, wenn ein oder mehrere Felder die Validierung nicht bestehen.

| Eigenschaft | Typ | Beschreibung |
|---|---|---|
| `name` | `string` | Immer `'CargoValidationError'` |
| `errors` | `CargoFieldError[]` | Liste der feldbezogenen Fehler |

### `CargoFieldError`

Repräsentiert einen einzelnen Feldvalidierungsfehler.

| Eigenschaft | Typ | Beschreibung |
|---|---|---|
| `name` | `string` | Immer `'CargoFieldError'` |
| `field` | `string \| symbol` | Der Name des fehlgeschlagenen Feldes |
| `message` | `string` | Die Fehlermeldung |

---

## Option 1: `setCargoErrorHandler` (Empfohlen)

Einmalig beim App-Start registrieren. Alle Validierungsfehler aller Routen werden automatisch behandelt.

```typescript
import { setCargoErrorHandler, CargoValidationError } from 'express-cargo'

setCargoErrorHandler((err, req, res, next) => {
    res.status(400).json({
        error: 'Validierung fehlgeschlagen',
        details: err.errors.map(e => ({
            field: e.field,
            message: e.message,
        })),
    })
})
```

**Beispielantwort:**
```json
{
    "error": "Validierung fehlgeschlagen",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```

---

## Option 2: Express-Fehler-Middleware

Verwenden Sie die Standard-4-Argument-Fehler-Middleware von Express, um `CargoValidationError` abzufangen.

```typescript
import { CargoValidationError } from 'express-cargo'
import { Request, Response, NextFunction } from 'express'

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        return res.status(400).json({
            error: 'Validierung fehlgeschlagen',
            details: err.errors.map(e => ({
                field: e.field,
                message: e.message,
            })),
        })
    }
    next(err)
})
```

> **Hinweis:** Wenn `setCargoErrorHandler` registriert ist, hat es Vorrang. Die Express-Fehler-Middleware empfängt den Fehler nur, wenn `next(err)` innerhalb von `setCargoErrorHandler` aufgerufen wird.

---

## Mehrere Fehler behandeln

Eine einzelne Anfrage kann mehrere Validierungen gleichzeitig fehlschlagen lassen. Alle Fehler werden gesammelt und zusammen zurückgegeben.

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

Wenn beide Felder ungültig sind, enthält `err.errors` zwei Einträge:

```json
{
    "error": "Validierung fehlgeschlagen",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```
