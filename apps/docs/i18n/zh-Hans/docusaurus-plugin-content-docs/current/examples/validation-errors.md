# 错误处理

验证失败时，`bindingCargo` 会抛出 `CargoValidationError`。你可以使用 `setCargoErrorHandler` 或 Express 内置错误处理中间件来处理该错误。

---

## 错误类型

### `CargoValidationError`

当一个或多个字段验证失败时抛出。

| 属性 | 类型 | 描述 |
|---|---|---|
| `name` | `string` | 始终为 `'CargoValidationError'` |
| `errors` | `CargoFieldError[]` | 字段级错误列表 |

### `CargoFieldError`

表示单个字段验证失败。

| 属性 | 类型 | 描述 |
|---|---|---|
| `name` | `string` | 始终为 `'CargoFieldError'` |
| `field` | `string \| symbol` | 验证失败的字段名称 |
| `message` | `string` | 错误消息 |

---

## 方案 1：`setCargoErrorHandler`（推荐）

在应用启动时注册一次全局处理器。所有路由中的验证错误都会被自动处理。

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

**响应示例：**

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

## 方案 2：Express 错误中间件

使用 Express 标准的 4 参数错误中间件来捕获 `CargoValidationError`。

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

> **注意：** 如果已注册 `setCargoErrorHandler`，它会优先执行。只有在 `setCargoErrorHandler` 内调用 `next(err)` 时，Express 错误中间件才会收到该错误。

---

## 处理多个错误

单个请求可能同时未通过多个验证。所有错误都会被收集并一起返回。

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

如果两个字段都无效，`err.errors` 将包含两个条目：

```json
{
    "error": "Validation failed",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```
