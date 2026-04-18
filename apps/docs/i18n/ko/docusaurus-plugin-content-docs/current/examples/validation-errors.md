---
id: validation-errors
title: 검증 오류 처리
---

검증이 실패하면 `bindingCargo`는 `CargoValidationError`를 던집니다. `setCargoErrorHandler` 또는 Express의 기본 에러 처리 미들웨어를 사용하여 이 에러를 처리할 수 있습니다.

---

## 에러 타입

### `CargoValidationError`

하나 이상의 필드가 검증에 실패했을 때 발생합니다.

| 속성 | 타입 | 설명 |
|---|---|---|
| `name` | `string` | 항상 `'CargoValidationError'` |
| `errors` | `CargoFieldError[]` | 필드별 에러 목록 |

### `CargoFieldError`

단일 필드 검증 실패를 나타냅니다.

| 속성 | 타입 | 설명 |
|---|---|---|
| `name` | `string` | 항상 `'CargoFieldError'` |
| `field` | `string \| symbol` | 실패한 필드 이름 |
| `message` | `string` | 에러 메시지 |

---

## 방법 1: `setCargoErrorHandler` (권장)

앱 시작 시 한 번 등록하면 모든 라우트의 검증 에러가 자동으로 처리됩니다.

```typescript
import { setCargoErrorHandler, CargoValidationError } from 'express-cargo'

setCargoErrorHandler((err, req, res, next) => {
    res.status(400).json({
        error: '검증 실패',
        details: err.errors.map(e => ({
            field: e.field,
            message: e.message,
        })),
    })
})
```

**응답 예시:**
```json
{
    "error": "검증 실패",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```

---

## 방법 2: Express 에러 미들웨어

Express의 4개 인자 에러 미들웨어를 사용하여 `CargoValidationError`를 처리합니다.

```typescript
import { CargoValidationError } from 'express-cargo'
import { Request, Response, NextFunction } from 'express'

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        return res.status(400).json({
            error: '검증 실패',
            details: err.errors.map(e => ({
                field: e.field,
                message: e.message,
            })),
        })
    }
    next(err)
})
```

> **참고:** `setCargoErrorHandler`가 등록된 경우 우선적으로 실행됩니다. Express 에러 미들웨어는 `setCargoErrorHandler` 내부에서 `next(err)`를 호출한 경우에만 에러를 받습니다.

---

## 여러 에러 처리

하나의 요청에서 여러 검증이 동시에 실패할 수 있습니다. 모든 에러는 수집되어 한 번에 반환됩니다.

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

두 필드가 모두 유효하지 않으면 `err.errors`에 두 개의 항목이 담깁니다:

```json
{
    "error": "검증 실패",
    "details": [
        { "field": "email", "message": "email should be a valid email" },
        { "field": "age", "message": "age must be >= 0" }
    ]
}
```
