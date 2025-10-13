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
curl -X POST --location "http://127.0.0.1:3000/body" \
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

```

```shell

```

---

### @Params

```typescript

```

```shell

```

---


### @Header

```typescript

```

```shell

```

---


### @Session

```typescript

```

```shell

```

---

### @Request

```typescript

```

```shell

```

---


### @Virtual

```typescript

```

```shell

```

---

## Validation
어떤 validation 을 적용할지 결정하는 데코레이터

### @optional

```typescript

```

```shell

```

---

### @default

```typescript

```

```shell

```

---

### @min

```typescript

```

```shell

```

---

### @max

```typescript

```

```shell

```

---

### @range

```typescript

```

```shell

```

---

### @prefix

```typescript

```

```shell

```

---

### @suffix

```typescript

```

```shell

```

---

### @equal

```typescript

```

```shell

```

---

### @notEqual

```typescript

```

```shell

```

---

### @isTrue

```typescript

```

```shell

```

---

### @isFalse

```typescript

```

```shell

```

---

### @length

```typescript

```

```shell

```

---

### @maxLength

```typescript

```

```shell

```

---

### @minLength

```typescript

```

```shell

```

---

### @oneOf

```typescript

```

```shell

```

---

### @validate

```typescript

```

```shell

```

---

### @regexp

```typescript

```

```shell

```

---

### @email

```typescript

```

```shell

```

---

## Transform
필드의 값 or 타입을 변경

### Type casting

```typescript

```

```shell

```

---

### transformer

```typescript

```

```shell

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
