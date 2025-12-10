# express-cargo

**express-cargo**는 Express.js에서 request 데이터를 더욱 쉽고 타입 안전하게 관리할 수 있도록 도와주는 미들웨어 라이브러리입니다.  
클래스 기반의 데코레이터와 바인딩 기능을 제공하여, 복잡한 request 파싱과 검증을 간결하게 처리할 수 있습니다.

---

## 설치

```bash
npm install express-cargo reflect-metadata
```

---

## TypeScript 설정
express-cargo는 TypeScript 데코레이터와 런타임 타입 메타데이터를 사용합니다.
정상적으로 동작시키기 위해서는 TypeScript를 설치하고 몇 가지 컴파일 옵션을 활성화해야 합니다.

### 1. TypeScript 설치 (아직 설치하지 않았다면)
```
npm install -D typescript
```

### 2. 데코레이터 지원 활성화
`tsconfig.json`에 다음을 추가하세요:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

---

## 빠른 시작

```ts
import express from 'express'
import { body, bindingCargo, getCargo, min, header, params } from 'express-cargo'

const app = express()
app.use(express.json())

class RequestExample {
    @body()
    name!: string

    @body()
    @min(0)
    age!: number

    @params('id')
    id!: number

    @header()
    authorization!: string
}

app.post('/:id', bindingCargo(RequestExample), (req, res) => {
    const data = getCargo<RequestExample>(req)
    // write your code with bound data
})

app.listen(3000)
```

---

## 문서

전체 가이드와 API 레퍼런스:  
👉 [express-cargo 문서](https://beyond-imagination.github.io/express-cargo/)

---

## 주요 특징

- **클래스 기반 request 파싱**: 데코레이터로 body, query, param 등 request 데이터를 자동으로 바인딩
- **타입 안전성**: TypeScript와 완벽하게 호환
- **간편한 미들웨어 적용**: 기존 Express 미들웨어와 쉽게 통합

---

### 요청 바인딩 데코레이터

| 데코레이터        | 설명                      | 예시                          |
|--------------|-------------------------|-----------------------------|
| `@body()`    | `req.body` 의 필드를 바인딩    | `@body() name: string`      |
| `@query()`   | `req.query` 의 필드를 바인딩   | `@query() page: number`     |
| `@params()`  | `req.params` 의 필드를 바인딩  | `@params() id: string`      |
| `@uri()`     | `@params()` 의 별칭        | `@uri() id: string`         |
| `@header()`  | `req.headers` 의 필드를 바인딩 | `@header() token: string`   |
| `@session()` | `req.session` 의 필드를 바인딩 | `@session() userId: string` |

---

### 검증 데코레이터

| 데코레이터                                | 설명                                                                                             | 예시                                                                                         |
|--------------------------------------|------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| `@optional()`                        | 값이 없는 경우 밸리데이션을 하지 않음                                                                          | `@optional() value?: number`                                                               |
| `@min(minimum: number)`              | 숫자가 `minimum` 이상이어야 함                                                                          | `@min(18) age!: number`                                                                    |
| `@max(maximum: number)`              | 숫자가 `maximum` 이하이어야 함                                                                          | `@max(100) score!: number`                                                                 |
| `@range(min: number, max: number)`   | 숫자가 `min` 이상 `max` 이하 범위에 포함되어야 함                                                              | `@range(1, 5) rating!: number`                                                             |
| `@prefix(prefixText: string)`        | 문자열이 `prefixText` 로 시작해야 함                                                                     | `@prefix('IMG_') fileName!: string`                                                        |
| `@suffix(suffixText: string)`        | 문자열이 `suffixText` 로 끝나야 함                                                                      | `@suffix('.jpg') fileName!: string`                                                        |
| `@length(value: number)`             | 문자열 길이가 정확히 `value` 여야 함                                                                       | `@length(6) otp!: string`                                                                  |
| `@minLength(min: number)`            | 문자열 길이가 `min` 이상이어야 함                                                                          | `@minLength(8) password!: string`                                                          |
| `@maxLength(max: number)`            | 문자열 길이가 `max` 이하이어야 함                                                                          | `@maxLength(20) username!: string`                                                         |
| `@equal(value: any)`                 | 값이 `value` 와 정확히 일치해야 함                                                                        | `@equal('production') env!: string`                                                        |
| `@notEqual(value: any)`              | 값이 `value` 와 달라야 함                                                                             | `@notEqual('admin') role!: string`                                                         |
| `@isTrue()`                          | 값이 `true` 여야 함                                                                                 | `@isTrue() acceptedTerms!: boolean`                                                        |
| `@isFalse()`                         | 값이 `false` 여야 함                                                                                | `@isFalse() blocked!: boolean`                                                             |
| `@oneOf(options: readonly any[])`    | 값이 `options` 중 하나여야 함                                                                          | `@oneOf(['credit','debit'] as const) method!: 'credit' \| 'debit'`                         |
| `@validate(validateFn, message?)`    | 커스텀 검증 함수를 사용                                                                                  | `@validate(v => typeof v === 'string' && v.includes('@'), 'invalid email') email!: string` |
| `@regexp(pattern: RegExp, message?)` | 문자열이 주어진 정규식을 만족해야 함                                                                           | `@regexp(/^[0-9]+$/, 'digits only') phone!: string`                                        |
| `@email()`                           | 값이 이메일 형식이어야 함                                                                                 | `@email() email!: string`                                                                  |
| `@With(fieldName: string)`           | 데코레이터가 적용된 필드에 값이 있을 경우, 지정된 대상 필드 (fieldName)도 반드시 값을 가져야 함을 검증하여, 두 필드 간의 필수적인 의존 관계를 설정합니다. | `@With('price') discountRate?: number`                                                     |

---

### Transform 데코레이터

| 데코레이터 | 설명 | 예시 |
|------------|------|------|
| `@transform(transformer)` | 파싱된 값에 추가 변환 적용 | `@transform(v => v.trim()) name!: string` |
| `@request(transformer)`   | Express Request 객체에서 값 추출 | `@request(req => req.ip) clientIp!: string` |
| `@virtual(transformer)`   | 다른 필드들을 기반으로 값 계산 | `@virtual(obj => obj.firstName + ' ' + obj.lastName) fullName!: string` |

### 유틸리티 데코레이터

| 데코레이터 | 설명 | 예시 |
|------------|------|------|
| `@defaultValue(value)` | 필드가 없을 때 기본값 설정 | `@defaultValue(0) count!: number` |
| `@array(elementType)`  | 배열 요소 타입 지정 | `@array(String) tags!: string[]` |

### 에러 처리

```ts
import { setCargoErrorHandler, CargoValidationError } from 'express-cargo'

// 커스텀 에러 핸들러
setCargoErrorHandler((err, req, res, next) => {
    if (err instanceof CargoValidationError) {
        res.status(400).json({
        error: 'Validation failed',
        details: err.errors.map(e => ({
                field: e.field,
                message: e.name
            }))
        })
    } else {
        next(err)
    }
})
```

## 라이선스

MIT
