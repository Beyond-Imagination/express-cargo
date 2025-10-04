# express-cargo 테스트
example app 은 express-cargo 를 쉽게 테스트 하기 위해 만들어진 툴입니다.

## Getting Started

```shell
pnpm install
pnpm dev
```

## test 목록

### @body

```
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


