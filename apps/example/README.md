# express-cargo 테스트
example app은 express-cargo를 쉽게 테스트하기 위해 만들어진 도구입니다.

## Getting Started

```shell
pnpm install
pnpm dev
```

## 테스트 목록

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
