# express-cargo 테스트
example app은 express-cargo를 쉽게 테스트하기 위해 만들어진 도구입니다.

## Getting Started

```shell
pnpm install
pnpm dev
```

# 테스트 목록

## Request Binding
필드에 적용하여 해당 필드의 값을 어디서 가져올지 결정하는 데코레이터

### @Body

```typescript
class BodyExample {
    @Body()
    number!: number

    @Body()
    string!: string

    @Body()
    boolean!: boolean
}

router.post('/body', bindingCargo(BodyExample), (req, res) => {
    const cargo = getCargo<BodyExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST --location "http://localhost:3000/body" \
    -H "Content-Type: application/json" \
    -d '{
            "number": 1,
            "string": "sss",
            "boolean": true
        }'
```

---

### @Query

```typescript
class QueryExample {
    @Query()
    number!: number

    @Query()
    string!: string

    @Query()
    boolean!: boolean
}

router.get('/query', bindingCargo(QueryExample), (req, res) => {
    const cargo = getCargo<QueryExample>(req)
    res.json(cargo)
})
```

```shell
curl -X GET 'http://localhost:3000/query?number=456&string=hello-query&boolean=false'
```

---

### @Params & @Uri

```typescript
class URIExample {
    @Uri()
    id!: number
}

router.get('/uri/:id', bindingCargo(URIExample), (req, res) => {
    const cargo = getCargo<URIExample>(req)
    res.json(cargo)
})
```

```shell
curl -X GET 'http://localhost:3000/uri/789'
```

---

### @Header

```typescript
class HeaderExample {
    @Header()
    authorization!: string
}

router.get('/header', bindingCargo(HeaderExample), (req, res) => {
    const cargo = getCargo<HeaderExample>(req)
    res.json(cargo)
})
```

```shell
curl -X GET 'http://localhost:3000/header' \
  -H 'Authorization: Bearer my-auth-token-123'
```

---

### @Session

```typescript
class CookieExample {
    @Session()
    path!: string

    @Session()
    httpOnly!: boolean

    @Session()
    secure!: boolean
}

class SessionExample {
    @Session()
    cookie!: CookieExample

    @Session()
    userId!: string
}

router.use(expressSession({ secret: 'test', resave: false, cookie: { secure: false } }))

router.post('/session', (req, res) => {
    ;(req as any).session.userId = 'test-user-id'
    res.sendStatus(204)
})

router.get('/session', bindingCargo(SessionExample), (req, res) => {
    const cargo = getCargo<SessionExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/session'
curl -X GET 'http://localhost:3000/session'
```

---

### @Request

```typescript
class RequestExample {
    @Request(req => req?.headers['x-custom-header'] as string)
    customHeader!: string
}

router.post('/request', bindingCargo(RequestExample), (req, res) => {
    const cargo = getCargo<RequestExample>(req)

    res.json({
        message: 'Header data mapped using @Request',
        data: cargo,
    })
})
```

```shell
curl -X POST 'http://localhost:3000/request' \
    -H 'Content-Type: application/json' \
    -H 'X-Custom-Header: data-from-my-app-123' \
    -d '{}'
```

---

### @Virtual

```typescript
class VirtualExample {
    @Body()
    price!: number

    @Body()
    quantity!: number

    @Virtual((obj: VirtualExample) => obj.price * obj.quantity)
    total!: number
}

router.post('/virtual', bindingCargo(VirtualExample), (req, res) => {
    const cargo = getCargo<VirtualExample>(req)
    res.json({
        message: 'Order data processed with @Virtual',
        data: cargo,
    })
})
```

```shell
curl -X POST 'http://localhost:3000/virtual' \
    -H 'Content-Type: application/json' \
    -d '{
        "price": 100,
        "quantity": 5
    }'
```

---

## Validation
어떤 validation 을 적용할지 결정하는 데코레이터

### @Optional

```typescript
class OptionalExample {
    @Body()
    @Optional()
    @Equal(1)
    number?: number
}

router.post('/optional', bindingCargo(OptionalExample), (req, res) => {
    const cargo = getCargo<OptionalExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/optional' \
    -H 'Content-Type: application/json' \
    -d '{"number": 1}'

curl -X POST 'http://localhost:3000/optional' \
    -H 'Content-Type: application/json' \
    -d '{}'
```

---

### @Default

```typescript
class DefaultExample {
    @Body()
    @Default(3)
    number!: number

    @Body()
    @Default('2')
    string!: string

    @Body()
    @Default(false)
    boolean!: boolean
}

router.post('/default', bindingCargo(DefaultExample), (req, res) => {
    const cargo = getCargo<DefaultExample>(req)
    res.json(cargo)
})
```

```shell
# default ignore
curl -X POST 'http://localhost:3000/default' \
    -H 'Content-Type: application/json' \
    -d '{
        "number": 99,
        "string": "custom-value",
        "boolean": true
    }'

# use default
curl -X POST 'http://localhost:3000/default' \
    -H 'Content-Type: application/json' \
    -d '{}'
```

---

### @Min

```typescript
class MinExample {
    @Body()
    @Min(1)
    number!: number
}

router.post('/min', bindingCargo(MinExample), (req, res) => {
    const cargo = getCargo<MinExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/min' \
-H 'Content-Type: application/json' \
-d '{
    "number": 1
}'
```

---

### @Max

```typescript
class MaxExample {
    @Body()
    @Max(10)
    number!: number
}

router.post('/max', bindingCargo(MaxExample), (req, res) => {
    const cargo = getCargo<MaxExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/max' \
-H 'Content-Type: application/json' \
-d '{
    "number": 10
}'
```

---

### @Range

```typescript
class RangeExample {
    @Body()
    @Range(10, 20)
    number1!: number
}

router.post('/range', bindingCargo(RangeExample), (req, res) => {
    const cargo = getCargo<RangeExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/range' \
    -H 'Content-Type: application/json' \
    -d '{
        "number1": 15
    }'
```

---

### @Prefix

```typescript
class PrefixExample {
    @Body()
    @Prefix('https://')
    url!: string
}

router.post('/prefix', bindingCargo(PrefixExample), (req, res) => {
    const cargo = getCargo<PrefixExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/prefix' \
    -H 'Content-Type: application/json' \
    -d '{"url": "https://example.com"}'
```

---

### @Suffix

```typescript
class SuffixExample {
    @Body()
    @Suffix('.png')
    photo!: string
}

router.post('/suffix', bindingCargo(SuffixExample), (req, res) => {
    const cargo = getCargo<SuffixExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/suffix' \
    -H 'Content-Type: application/json' \
    -d '{"photo": "my_picture.png"}'
```

---

### @Equal

```typescript
class EqualExample {
    @Body()
    @Equal(3)
    number!: number

    @Body()
    @Equal('text')
    string!: string

    @Body()
    @Equal(true)
    boolean!: boolean
}

router.post('/equal', bindingCargo(EqualExample), (req, res) => {
    const cargo = getCargo<EqualExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/equal' \
    -H 'Content-Type: application/json' \
    -d '{
        "number": 3,
        "string": "text",
        "boolean": true
    }'
```

---

### @NotEqual

```typescript
class NotEqualExample {
    @Body()
    @NotEqual(3)
    number!: number

    @Body()
    @NotEqual('text')
    string!: string

    @Body()
    @NotEqual(true)
    boolean!: boolean
}

router.post('/not-equal', bindingCargo(NotEqualExample), (req, res) => {
    const cargo = getCargo<NotEqualExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/not-equal' \
    -H 'Content-Type: application/json' \
    -d '{
        "number": 4,
        "string": "other-text",
        "boolean": false
    }'
```

---

### @IsTrue

```typescript
class IsTrueExample {
    @Body()
    @IsTrue()
    booleanValue!: boolean
}

router.post('/is-true', bindingCargo(IsTrueExample), (req, res) => {
    const cargo = getCargo<IsTrueExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/is-true' \
    -H 'Content-Type: application/json' \
    -d '{"booleanValue": true}'
```

---

### @IsFalse

```typescript
class IsFalseExample {
    @Body()
    @IsFalse()
    booleanValue!: boolean
}

router.post('/is-false', bindingCargo(IsFalseExample), (req, res) => {
    const cargo = getCargo<IsFalseExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/is-false' \
    -H 'Content-Type: application/json' \
    -d '{"booleanValue": false}'
```

---

### @Length

```typescript
class LengthExample {
    @Body()
    @Length(2)
    name!: string
}

router.post('/length', bindingCargo(LengthExample), (req, res) => {
    const cargo = getCargo<LengthExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/length' \
    -H 'Content-Type: application/json' \
    -d '{"name": "AB"}'
```

---

### @MaxLength

```typescript
class MaxLengthExample {
    @Body()
    @MaxLength(5)
    name!: string
}

router.post('/max-length', bindingCargo(MaxLengthExample), (req, res) => {
    const cargo = getCargo<MaxLengthExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/max-length' \
    -H 'Content-Type: application/json' \
    -d '{"name": "hello"}'
```

---

### @MinLength

```typescript
class MinLengthExample {
    @Body()
    @MinLength(2)
    name!: string
}

router.post('/min-length', bindingCargo(MinLengthExample), (req, res) => {
    const cargo = getCargo<MinLengthExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/min-length' \
    -H 'Content-Type: application/json' \
    -d '{"name": "ok"}'
```

---

### @OneOf

```typescript
class OneOfExample {
    @Body()
    @OneOf(['js', 'ts', 'html', 'css'])
    language!: string
}

router.post('/one-of', bindingCargo(OneOfExample), (req, res) => {
    const cargo = getCargo<OneOfExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/one-of' \
    -H 'Content-Type: application/json' \
    -d '{"language": "ts"}'
```

---

### @Validate

```typescript
class ValidateExample {
    @Body()
    @Validate(email => (email as string).split('@').length === 2)
    email!: string
}

router.post('/validate', bindingCargo(ValidateExample), (req, res) => {
    const cargo = getCargo<ValidateExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/validate' \
    -H 'Content-Type: application/json' \
    -d '{"email": "test@example.com"}'
```

---

### @Regexp

```typescript
class RegexpExample {
    @Body()
    @Regexp(/^01[016789]-\d{3,4}-\d{4}$/)
    phone!: string
}

router.post('/regexp', bindingCargo(RegexpExample), (req, res) => {
    const cargo = getCargo<RegexpExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/regexp' \
    -H 'Content-Type: application/json' \
    -d '{"phone": "010-1234-5678"}'
```

---

### @Email

```typescript
class EmailExample {
    @Body()
    @Email()
    email!: string
}

router.post('/email', bindingCargo(EmailExample), (req, res) => {
    const cargo = getCargo<EmailExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/email' \
    -H 'Content-Type: application/json' \
    -d '{"email": "user.name@sub.domain.co.kr"}'
```

---

### @Uuid

```typescript
class UuidExample {
    @Body()
    @Uuid()
    uuidAll!: string

    @Body()
    @Uuid('v4')
    uuid!: string
}

router.post('/uuid', bindingCargo(UuidExample), (req, res) => {
    const cargo = getCargo<UuidExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/uuid' \
    -H 'Content-Type: application/json' \
    -d '{
      "uuidAll": "6bb113fd-4dcb-1197-956d-ba9033e22c69",
      "uuid": "a91f62e5-28aa-48a1-ae2d-95e41c164113"
    }'
```

---

### Alphanumeric

```typescript
class AlphanumericExample {
    @Body()
    @Alphanumeric()
    alphanumeric!: string
}

router.post('/alphanumeric', bindingCargo(AlphanumericExample), (req, res) => {
    const cargo = getCargo<AlphanumericExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/alphanumeric' \
    -H 'Content-Type: application/json' \
    -d '{ "alphanumeric": "abc123" }'
```
---

## Transform
필드의 값 or 타입을 변경

### Type casting

```typescript
class CustomClass {
    @Body()
    name!: string

    @Body()
    age!: number
}

class BasicTypeSample {
    @Body()
    string!: string

    @Uri()
    number!: number

    @Body()
    boolean!: boolean

    @Body()
    date!: Date

    @Body()
    customObject!: CustomClass
}

router.post('/type-casting/:number', bindingCargo(BasicTypeSample), (req, res) => {
    const cargo = getCargo<BasicTypeSample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/type-casting/10' \
    -H 'Content-Type: application/json' \
    -d '{
        "string": "test",
        "boolean": "true",
        "date": "2025-10-26",
        "customObject": {
            "name": "Jane Doe",
            "age": 26
        }
    }'
```

### Array Type casting

```typescript
class CustomClass {
    @Body()
    name!: string

    @Body()
    age!: number
}

class ArraySample {
    @Body()
    @Array(String)
    stringArray!: string[]

    @Body()
    @Array(Number)
    numberArray!: number[]

    @Body()
    @Array(Boolean)
    booleanArray!: boolean[]

    @Body()
    @Array(Date)
    dateArray!: Date[]

    @Body()
    @Array('string')
    stringLiteralArray!: string[]

    @Body()
    @Array(CustomClass)
    customClassArray!: CustomClass[]
}

router.post('/array', bindingCargo(ArraySample), (req, res) => {
    const cargo = getCargo<ArraySample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/array' \
    -H 'Content-Type: application/json' \
    -d '{
        "stringArray": ["apple", "banana", "cherry"],
        "numberArray": [10, 20, 30],
        "booleanArray": [true, false, true],
        "dateArray": ["2023-01-01T00:00:00Z", "2023-12-31T23:59:59Z"],
        "stringLiteralArray": ["foo", "bar"],
        "customClassArray": [
            { "name": "Alice", "age": 30 },
            { "name": "Bob", "age": 25 }
        ]
    }'
```

---

### @Transform

```typescript
class TransformExample {
    @Query()
    @Transform((value: string) => value.toLowerCase())
    sortBy!: string

    @Query()
    @Transform((value: number) => value * 2)
    count!: number
}

router.get('/transform', bindingCargo(TransformExample), (req, res) => {
    const cargo = getCargo<TransformExample>(req)

    res.json({
        message: 'Search parameters transformed successfully!',
        data: cargo,
        sortByType: typeof cargo?.sortBy,
        countType: typeof cargo?.count,
        doubleCount: cargo?.count,
    })
})
```

```shell
curl -X GET 'http://localhost:3000/transform?sortBy=NAME&count=5'
```

---

## Error Handling
express-cargo 의 에러 핸들링 방식

### Field validation Error

```typescript
const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof CargoValidationError) {
        res.status(400).json({
            name: error.name,
            errors: error.errors,
            message: error.message,
        })
    } else if (error instanceof CargoTransformFieldError || error instanceof CargoFieldError) {
        res.status(400).json({
            name: error.name,
            field: error.field,
            message: error.message,
        })
    } else {
        res.status(500).json({
            name: 'Internal Server Error',
            message: error.message,
        })
    }
}

class ErrorHandlerExample {
    @Body()
    @MaxLength(10)
    name!: string

    @Body()
    @Email()
    @Transform((target: string) => target.toLowerCase())
    email!: string
}

router.post('/error-handler', bindingCargo(ErrorHandlerExample), (req, res) => {
    const cargo = getCargo<ErrorHandlerExample>(req)
    res.json(cargo)
})

router.use(errorHandler)
```

```shell
# correct request
curl -X POST 'http://localhost:3000/error-handler' \
    -H 'Content-Type: application/json' \
    -d '{
        "name": "Jane Doe",
        "email": "janeDoe123@epxress-cargo.com"
    }'

# raise cargo error
curl -X POST 'http://localhost:3000/error-handler' \
    -H 'Content-Type: application/json' \
    -d '{
        "name": "Jane Marie Roe",
        "email": "janeDoe123"
    }'
```

---

### Error handler 세팅

`setCargoErrorHandler`를 이용해 커스텀 에러 핸들러를 설정할 수 있습니다. express-cargo에서 발생시키는 에러를 처리하는 함수를 정의할 수 있습니다.

```typescript
setCargoErrorHandler((err: CargoValidationError, req: Request, res: Response, next: NextFunction) => {
    res.status(422).json({
        code: 'VALIDATION_ERROR',
        message: '입력값이 올바르지 않습니다.',
        details: err.errors.map(e => ({
            name: e.name,
            message: e.message,
        })),
    })
});

// body example code
router.post('/body', bindingCargo(BodyExample), (req, res) => {
    const cargo = getCargo<BodyExample>(req)
    res.json(cargo)
})

// min exmaple code
router.post('/min', bindingCargo(MinExample), (req, res) => {
    const cargo = getCargo<MinExample>(req)
    res.json(cargo)
})
```

```shell
# response has error message
curl -X POST 'http://localhost:3000/body' \
-H 'Content-Type: application/json' \
-d '{
    "number": 123
}'

curl -X POST 'http://localhost:3000/min' \
-H 'Content-Type: application/json' \
-d '{
    "number": -10
}'
```

---

## Binding
request 를 지정된 class 의 object 로 변경

### bindingCargo & getCargo

```typescript
class PostData {
    @Body()
    name!: string

    @Body()
    content!: string
}

class BodyExample {
    @Body()
    @Array(PostData)
    posts!: PostData[]
}

class IntegrationExample extends BodyExample {
    @Query()
    today!: Date

    @Params()
    @validate(value => typeof value === 'number' && value > 0 && value <= 100)
    case!: number

    @Header()
    @validate(value => value === 'application/json')
    'content-type'!: string

    @Request((request: Request) => request.headers['authorization'])
    @Prefix('Bearer ')
    @Transform((value: string) => value.substring(7))
    token!: string
}

router.post('/integration/:case', bindingCargo(IntegrationExample), (req, res) => {
    const cargo = getCargo<IntegrationExample>(req)
    res.json(cargo)
})
```

```shell
curl -X POST 'http://localhost:3000/integration/20?today=2025-10-28' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer eyJhb...'
-d '{
        "posts": [
          { "name": "post1", "content": "hello..." },
          { "name": "post2", "content": "About express-cargo..." },
          { "name": "post3", "content": "Test Integration..." }
        ]
    }'
```

---
