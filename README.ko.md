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
import { Body, bindingCargo, getCargo, Min, Header, Params } from 'express-cargo'

const app = express()
app.use(express.json())

class RequestExample {
    @Body()
    name!: string

    @Body()
    @Min(0)
    age!: number

    @Params('id')
    id!: number

    @Header()
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
| `@Body()`    | `req.body` 의 필드를 바인딩    | `@Body() name: string`      |
| `@Query()`   | `req.query` 의 필드를 바인딩   | `@Query() page: number`     |
| `@Params()`  | `req.params` 의 필드를 바인딩  | `@Params() id: string`      |
| `@Uri()`     | `@Params()` 의 별칭        | `@Uri() id: string`         |
| `@Header()`  | `req.headers` 의 필드를 바인딩 | `@Header() token: string`   |
| `@Session()` | `req.session` 의 필드를 바인딩 | `@Session() userId: string` |
---

### 검증 데코레이터

| 데코레이터                                                                         | 설명                                                                                             | 예시                                                                                         |
|-------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| `@Optional()`                                                                 | 값이 없는 경우 밸리데이션을 하지 않음                                                                          | `@Optional() value?: number`                                                               |
| `@Min(minimum: number)`                                                       | 숫자가 `minimum` 이상이어야 함                                                                          | `@Min(18) age!: number`                                                                    |
| `@Max(maximum: number)`                                                       | 숫자가 `maximum` 이하이어야 함                                                                          | `@Max(100) score!: number`                                                                 |
| `@Range(min: number, max: number)`                                            | 숫자가 `min` 이상 `max` 이하 범위에 포함되어야 함                                                              | `@Range(1, 5) rating!: number`                                                             |
| `@Contains(seed: string)`                                                     | 문자열이 `seed` 를 포함해야 함                                                                           | `@Contains('hello') greeting!: string`                                                     |
| `@Prefix(prefixText: string)`                                                 | 문자열이 `prefixText` 로 시작해야 함                                                                     | `@Prefix('IMG_') fileName!: string`                                                        |
| `@Suffix(suffixText: string)`                                                 | 문자열이 `suffixText` 로 끝나야 함                                                                      | `@Suffix('.jpg') fileName!: string`                                                        |
| `@Length(value: number)`                                                      | 문자열 길이가 정확히 `value` 여야 함                                                                       | `@Length(6) otp!: string`                                                                  |
| `@MinLength(min: number)`                                                     | 문자열 길이가 `min` 이상이어야 함                                                                          | `@MinLength(8) password!: string`                                                          |
| `@MaxLength(max: number)`                                                     | 문자열 길이가 `max` 이하이어야 함                                                                          | `@MaxLength(20) username!: string`                                                         |
| `@Equal(value: any)`                                                          | 값이 `value` 와 정확히 일치해야 함                                                                        | `@Equal('production') env!: string`                                                        |
| `@NotEqual(value: any)`                                                       | 값이 `value` 와 달라야 함                                                                             | `@NotEqual('admin') role!: string`                                                         |
| `@IsTrue()`                                                                   | 값이 `true` 여야 함                                                                                 | `@IsTrue() acceptedTerms!: boolean`                                                        |
| `@IsFalse()`                                                                  | 값이 `false` 여야 함                                                                                | `@IsFalse() blocked!: boolean`                                                             |
| `@OneOf(options: readonly any[])`                                             | 값이 `options` 중 하나여야 함                                                                          | `@OneOf(['credit','debit'] as const) method!: 'credit' \| 'debit'`                         |
| `@ListContains(values: any[], comparator?: (expected, actual) => boolean)`    | 배열이 지정된 모든 값을 포함해야 함. `comparator` 제공 시 모든 비교를 위임                                              | `@ListContains([1, 2]) nums!: number[]`                                                    |
| `@ListNotContains(values: any[], comparator?: (expected, actual) => boolean)` | 배열이 지정된 값을 포함하지 않아야 함. `comparator` 제공 시 모든 비교를 위임                                             | `@ListNotContains([1, 2]) nums!: number[]`                                                 |
| `@ListMaxSize(max: number, message?)`                                         | 배열의 요소 수가 `max` 이하이어야 함                                                                        | `@ListMaxSize(5) tags!: string[]`                                                          |
| `@ListMinSize(min: number, message?)`                                         | 배열의 요소 수가 `min` 이상이어야 함                                                                        | `@ListMinSize(5) tags!: string[]`                                                          |
| `@Enum(enumObj: object, message?)`                                            | 값이 `enumObj`의 멤버여야 함                                                                           | `@Enum(UserRole) role!: UserRole`                                                          |
| `@Validate(validateFn, message?)`                                             | 커스텀 검증 함수를 사용                                                                                  | `@Validate(v => typeof v === 'string' && v.includes('@'), 'invalid email') email!: string` |
| `@Regexp(pattern: RegExp, message?)`                                          | 문자열이 주어진 정규식을 만족해야 함                                                                           | `@Regexp(/^[0-9]+$/, 'digits only') phone!: string`                                        |
| `@Email()`                                                                    | 값이 이메일 형식이어야 함                                                                                 | `@Email() email!: string`                                                                  |
| `@Uuid(version?, message?)`                                                   | 값이 유효한 UUID 형식이어야 하며, 선택적으로 특정 버전(v1, v3, v4, v5)으로 제한할 수 있습니다.                                | `@Uuid('v4') requestId!: string`                                                           |
| `@Alpha(message?: string)`                                                    | 문자열에 알파벳(A–Z, a–z)만 포함되어야 합니다.                                                                 | `@Alpha() firstName!: string `                                                             |
| `@Alphanumeric(message?: string)`                                             | 필드에 알파벳과 숫자(A-Z, a-z, 0-9)만 포함되어야 합니다.                                                         | `@Alphanumeric() productCode!: string`                                                     |
| `@IsUppercase(message?: string)`                                              | 필드에 대문자만 포함되어야 합니다.                                                                            | `@IsUppercase() countryCode!: string`                                                      |
| `@IsLowercase(message?: string)`                                              | 필드에 소문자만 포함되어야 합니다.                                                                            | `@IsLowercase() username!: string`                                                         |
| `@IsJwt(message?: string)`                                                    | 필드가 유효한 JSON Web Token(JWT)인지 검증합니다. Base64URL 문자로 이루어진 `header.payload.signature` 형식이어야 합니다.  | `@IsJwt() accessToken!: string`                                                            |
| `@IsUrl(options?: IsUrlOptions, message?: string)`                            | 필드가 유효한 URL인지 검증합니다. 기본적으로 `http`, `https`, `ftp` 프로토콜을 허용하며, `options.protocols`로 변경할 수 있습니다. | `@IsUrl() website!: string`                                                                |
| `@IsTimeZone(message?: string)`                                               | 필드가 유효한 IANA 타임존 식별자인지 검증합니다(예: `Asia/Seoul`, `UTC`). 내장 `Intl` API를 사용합니다.                      | `@IsTimeZone() tz!: string`                                                                |
| `@IsHexColor(message?: string)`                                               | 필드가 유효한 16진수 색상 코드인지 검증합니다. `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA` 형식을 지원합니다(대소문자 구분 없음).          | `@IsHexColor() color!: string`                                                             |
| `@IsHexadecimal(message?: string)`                                            | 필드가 16진수 숫자인지 검증합니다. `0-9` 및 `a-f` 문자(대소문자 구분 없음)만 허용되며, `0x` 접두사도 허용됩니다.                      | `@IsHexadecimal() color!: string`                                                          |
| `@MinDate(min: Date \| (() => Date), message?: string)`                       | 필드가 주어진 최소 날짜와 같거나 이후인 `Date`인지 검증합니다. 고정 날짜 또는 동적 비교를 위한 함수를 받습니다.                            | `@MinDate(new Date('2000-01-01')) createdAt!: Date`                                        |
| `@MaxDate(max: Date \| (() => Date), message?: string)`                       | 필드가 주어진 최대 날짜와 같거나 이전인 `Date`인지 검증합니다. 고정 날짜 또는 동적 비교를 위한 함수를 받습니다.                            | `@MaxDate(new Date('2099-12-31')) createdAt!: Date`                                        |
| `@With(fieldName: string)`                                                    | 데코레이터가 적용된 필드에 값이 있을 경우, 지정된 대상 필드 (fieldName)도 반드시 값을 가져야 함을 검증하여, 두 필드 간의 필수적인 의존 관계를 설정합니다. | `@With('price') discountRate?: number`                                                     |
| `@Without(fieldName: string)`                                                 | 데코레이터가 선언된 필드에 값이 있을 경우, 지정된 타겟 필드(fieldName)는 반드시 값이 없어야 함을 검증하여 상호 배타적 관계를 설정합니다.            | `@Without('isGuest') password?: string`                                                    |

---

### Transform 데코레이터

| 데코레이터                     | 설명                        | 예시                                                                      |
|---------------------------|---------------------------|-------------------------------------------------------------------------|
| `@Transform(transformer)` | 파싱된 값에 추가 변환 적용           | `@Transform(v => v.trim()) name!: string`                               |
| `@Request(transformer)`   | Express Request 객체에서 값 추출 | `@Request(req => req.ip) clientIp!: string`                             |
| `@Virtual(transformer)`   | 다른 필드들을 기반으로 값 계산         | `@Virtual(obj => obj.firstName + ' ' + obj.lastName) fullName!: string` |

### 유틸리티 데코레이터

| 데코레이터                              | 설명                                                | 예시                                  |
|------------------------------------|---------------------------------------------------|-------------------------------------|
| `@Type(typeFn, options?)`          | 입력 데이터를 어떤 클래스 인스턴스로 변환할지 정의합니다. (다형성 및 순환 참조 지원) | `@Type(() => User) user!: User`     |
| `@DefaultValue(value)`             | 필드가 없을 때 기본값 설정                                   | `@DefaultValue(0) count!: number`   |
| `@List(elementType)`               | 배열 요소 타입 지정                                       | `@List(String) tags!: string[]`     |
| `@Each((validator \| function)[])` | 배열 내의 모든 요소에 대해 지정된 검증 규칙을 개별적으로 적용               | `@Each(Length(10)) tags!: string[]` |

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
