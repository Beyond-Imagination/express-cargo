# Gestion des erreurs

Lorsque la validation échoue, `bindingCargo` lance une `CargoValidationError`. Vous pouvez gérer cette erreur avec `setCargoErrorHandler` ou le middleware de gestion d'erreurs intégré d'Express.

---

## Types d'erreurs

### `CargoValidationError`

Lancée lorsqu'un ou plusieurs champs échouent à la validation.

| Propriété | Type | Description |
|---|---|---|
| `name` | `string` | Toujours `'CargoValidationError'` |
| `errors` | `CargoFieldError[]` | Liste des erreurs par champ |

### `CargoFieldError`

Représente l'échec de validation d'un seul champ.

| Propriété | Type | Description |
|---|---|---|
| `name` | `string` | Toujours `'CargoFieldError'` |
| `field` | `string \| symbol` | Le nom du champ en échec |
| `message` | `string` | Le message d'erreur |

---

## Option 1 : `setCargoErrorHandler` (Recommandé)

Enregistrez un gestionnaire global une seule fois au démarrage de l'application. Toutes les erreurs de validation de chaque route seront traitées automatiquement.

```typescript
import { setCargoErrorHandler, CargoValidationError } from 'express-cargo'

setCargoErrorHandler((err, req, res, next) => {
    res.status(400).json({
        error: 'Validation échouée',
        details: err.errors.map(e => ({
            field: e.field,
            message: e.message,
        })),
    })
})
```

**Exemple de réponse :**
```json
{
    "error": "Validation échouée",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```

---

## Option 2 : Middleware d'erreur Express

Utilisez le middleware d'erreur standard à 4 arguments d'Express pour capturer `CargoValidationError`.

```typescript
import { CargoValidationError } from 'express-cargo'
import { Request, Response, NextFunction } from 'express'

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        return res.status(400).json({
            error: 'Validation échouée',
            details: err.errors.map(e => ({
                field: e.field,
                message: e.message,
            })),
        })
    }
    next(err)
})
```

> **Note :** Si `setCargoErrorHandler` est enregistré, il a la priorité. Le middleware d'erreur Express ne recevra l'erreur que si `next(err)` est appelé à l'intérieur de `setCargoErrorHandler`.

---

## Gestion de plusieurs erreurs

Une seule requête peut échouer à plusieurs validations simultanément. Toutes les erreurs sont collectées et retournées ensemble.

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

Si les deux champs sont invalides, `err.errors` contiendra deux entrées :

```json
{
    "error": "Validation échouée",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```
