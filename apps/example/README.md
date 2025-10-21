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

### @body

```typescript
class BodyExample {
    @body()
    number!: number

    @body()
    string!: string

    @body()
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

### @query

```typescript
class QueryExample {
    @query()
    number!: number

    @query()
    string!: string

    @query()
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

### @params & @uri

```typescript
class URIExample {
    @uri()
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

### @header

```typescript
class HeaderExample {
    @header()
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

### @session

```typescript
class CookieExample {
    @session()
    path!: string

    @session()
    httpOnly!: boolean

    @session()
    secure!: boolean
}

class SessionExample {
    @session()
    cookie!: CookieExample

    @session()
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

### @request

```typescript
class RequestExample {
    @request((req: Request) => req?.headers['x-custom-header'] as string)
    customHeader!: string
}

router.post('/request', bindingCargo(RequestExample), (req, res) => {
    const cargo = getCargo<RequestExample>(req)

    res.json({
        message: 'Header data mapped using @request',
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

### @virtual

```typescript
class VirtualExample {
    @body()
    price!: number

    @body()
    quantity!: number

    @virtual((obj: VirtualExample) => obj.price * obj.quantity)
    total!: number
}

router.post('/virtual', bindingCargo(VirtualExample), (req, res) => {
    const cargo = getCargo<VirtualExample>(req)
    res.json({
        message: 'Order data processed with @virtual',
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

### @optional

```typescript
class OptionalExample {
    @body()
    @optional()
    @equal(1)
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

### @default

```typescript
class DefaultExample {
    @body()
    @defaultValue(3)
    number!: number

    @body()
    @defaultValue('2')
    string!: string

    @body()
    @defaultValue(false)
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

### @min

```typescript
class MinExample {
    @body()
    @min(1)
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

### @max

```typescript
class MaxExample {
    @body()
    @max(10)
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

### @range

```typescript
class RangeExample {
    @body()
    @range(10, 20)
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

### @prefix

```typescript
class PrefixExample {
    @body()
    @prefix('https://')
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

### @suffix

```typescript
class SuffixExample {
    @body()
    @suffix('.png')
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

### @equal

```typescript
class EqualExample {
    @body()
    @equal(3)
    number!: number

    @body()
    @equal('text')
    string!: string

    @body()
    @equal(true)
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

### @notEqual

```typescript
class NotEqualExample {
    @body()
    @notEqual(3)
    number!: number

    @body()
    @notEqual('text')
    string!: string

    @body()
    @notEqual(true)
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

### @isTrue

```typescript
class IsTrueExample {
    @body()
    @isTrue()
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

### @isFalse

```typescript
class IsFalseExample {
    @body()
    @isFalse()
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

### @length

```typescript
class LengthExample {
    @body()
    @length(2)
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

### @maxLength

```typescript
class MaxLengthExample {
    @body()
    @maxLength(5)
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

### @minLength

```typescript
class MinLengthExample {
    @body()
    @minLength(2)
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

### @oneOf

```typescript
class OneOfExample {
    @body()
    @oneOf(['js', 'ts', 'html', 'css'])
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

### @validate

```typescript
class ValidateExample {
    @body()
    @validate(email => (email as string).split('@').length === 2)
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

### @regexp

```typescript
class RegexpExample {
    @body()
    @regexp(/^01[016789]-\d{3,4}-\d{4}$/)
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

### @email

```typescript
class EmailExample {
    @body()
    @email()
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

## Transform
필드의 값 or 타입을 변경

### Type casting

```typescript

```

```shell

```

### Array Type casting

```typescript
class CustomClass {
    @body()
    name!: string

    @body()
    age!: number
}

class ArraySample {
    @body()
    @array(String)
    stringArray!: string[]

    @body()
    @array(Number)
    numberArray!: number[]

    @body()
    @array(Boolean)
    booleanArray!: boolean[]

    @body()
    @array(Date)
    dateArray!: Date[]

    @body()
    @array('string')
    stringLiteralArray!: string[]

    @body()
    @array(CustomClass)
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

### @transform

```typescript
class TransformExample {
    @query()
    @transform((value: string) => value.toLowerCase())
    sortBy!: string

    @query()
    @transform((value: number) => value * 2)
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

```

```shell

```

---

### Error handler 세팅

```typescript

```

```shell

```

---

## Binding
request 를 지정된 class 의 object 로 변경

### bindingCargo

```typescript

```

```shell

```

---

### getCargo

```typescript

```

```shell

```

---
