# エラーハンドリング

バリデーションが失敗すると、`bindingCargo` は `CargoValidationError` をスローします。`setCargoErrorHandler` または Express の標準エラーハンドリングミドルウェアを使用してこのエラーを処理できます。

---

## エラーの種類

### `CargoValidationError`

1つ以上のフィールドがバリデーションに失敗した場合にスローされます。

| プロパティ | 型 | 説明 |
|---|---|---|
| `name` | `string` | 常に `'CargoValidationError'` |
| `errors` | `CargoFieldError[]` | フィールドごとのエラー一覧 |

### `CargoFieldError`

単一フィールドのバリデーション失敗を表します。

| プロパティ | 型 | 説明 |
|---|---|---|
| `name` | `string` | 常に `'CargoFieldError'` |
| `field` | `string \| symbol` | 失敗したフィールド名 |
| `message` | `string` | エラーメッセージ |

---

## 方法 1: `setCargoErrorHandler`（推奨）

アプリ起動時に一度登録するだけで、すべてのルートのバリデーションエラーを自動的に処理します。

```typescript
import { setCargoErrorHandler, CargoValidationError } from 'express-cargo'

setCargoErrorHandler((err, req, res, next) => {
    res.status(400).json({
        error: 'バリデーション失敗',
        details: err.errors.map(e => ({
            field: e.field,
            message: e.message,
        })),
    })
})
```

**レスポンス例:**
```json
{
    "error": "バリデーション失敗",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```

---

## 方法 2: Express エラーミドルウェア

Express の 4 引数エラーミドルウェアを使用して `CargoValidationError` を処理します。

```typescript
import { CargoValidationError } from 'express-cargo'
import { Request, Response, NextFunction } from 'express'

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        return res.status(400).json({
            error: 'バリデーション失敗',
            details: err.errors.map(e => ({
                field: e.field,
                message: e.message,
            })),
        })
    }
    next(err)
})
```

> **注意:** `setCargoErrorHandler` が登録されている場合は優先して実行されます。Express エラーミドルウェアがエラーを受け取るのは、`setCargoErrorHandler` 内で `next(err)` が呼び出された場合のみです。

---

## 複数エラーの処理

1つのリクエストで複数のバリデーションが同時に失敗することがあります。すべてのエラーは収集され、まとめて返されます。

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

両方のフィールドが無効な場合、`err.errors` には2つのエントリが含まれます:

```json
{
    "error": "バリデーション失敗",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```
