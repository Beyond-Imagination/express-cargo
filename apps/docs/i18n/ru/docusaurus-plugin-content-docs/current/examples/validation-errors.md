# Обработка ошибок

При неудачной валидации `bindingCargo` выбрасывает `CargoValidationError`. Вы можете обработать эту ошибку с помощью `setCargoErrorHandler` или встроенного middleware обработки ошибок Express.

---

## Типы ошибок

### `CargoValidationError`

Выбрасывается, когда одно или несколько полей не проходят валидацию.

| Свойство | Тип | Описание |
|---|---|---|
| `name` | `string` | Всегда `'CargoValidationError'` |
| `errors` | `CargoFieldError[]` | Список ошибок по полям |

### `CargoFieldError`

Представляет ошибку валидации одного поля.

| Свойство | Тип | Описание |
|---|---|---|
| `name` | `string` | Всегда `'CargoFieldError'` |
| `field` | `string \| symbol` | Имя поля, не прошедшего валидацию |
| `message` | `string` | Сообщение об ошибке |

---

## Вариант 1: `setCargoErrorHandler` (Рекомендуется)

Зарегистрируйте глобальный обработчик один раз при запуске приложения. Все ошибки валидации на каждом маршруте будут обрабатываться автоматически.

```typescript
import { setCargoErrorHandler, CargoValidationError } from 'express-cargo'

setCargoErrorHandler((err, req, res, next) => {
    res.status(400).json({
        error: 'Ошибка валидации',
        details: err.errors.map(e => ({
            field: e.field,
            message: e.message,
        })),
    })
})
```

**Пример ответа:**
```json
{
    "error": "Ошибка валидации",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```

---

## Вариант 2: Middleware ошибок Express

Используйте стандартный 4-аргументный middleware ошибок Express для перехвата `CargoValidationError`.

```typescript
import { CargoValidationError } from 'express-cargo'
import { Request, Response, NextFunction } from 'express'

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        return res.status(400).json({
            error: 'Ошибка валидации',
            details: err.errors.map(e => ({
                field: e.field,
                message: e.message,
            })),
        })
    }
    next(err)
})
```

> **Примечание:** Если `setCargoErrorHandler` зарегистрирован, он имеет приоритет. Middleware ошибок Express получит ошибку только в том случае, если `next(err)` вызван внутри `setCargoErrorHandler`.

---

## Обработка нескольких ошибок

Один запрос может не пройти несколько валидаций одновременно. Все ошибки собираются и возвращаются вместе.

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

Если оба поля невалидны, `err.errors` будет содержать две записи:

```json
{
    "error": "Ошибка валидации",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```
