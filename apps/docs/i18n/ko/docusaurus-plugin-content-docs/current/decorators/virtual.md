---
id: virtual
title: 가상 필드
---

# 가상 필드 데코레이터 (Virtual Field Decorators)

**Express-Cargo**는 **가상 필드(virtual fields)**와 **요청 기반 필드(request-derived fields)**를 정의할 수 있는 데코레이터를 제공합니다. 이 데코레이터들을 사용하면 값이 동적으로 계산되거나, `Request`에서 직접 객체의 속성으로 매핑될 수 있습니다.

## Built-in Virtual Decorators

### `@Virtual<T>(transformer: (obj: object) => T)`

`@Virtual` 데코레이터는 **계산된 속성(computed property)**을 정의합니다. 이 속성은 요청에서 직접 가져오는 것이 아니라, 객체의 다른 속성을 기반으로 값을 계산합니다.

- **`transformer`**: 객체 인스턴스를 받아 계산된 값을 반환하는 함수

### `@Request<T>(transformer: (req: Request) => T)`

`@Request` 데코레이터는 Express `Request` 객체에서 값을 가져와 클래스 속성에 바인딩합니다.

- **`transformer`**: 요청 객체를 받아 바인딩할 값을 반환하는 함수

`@Request`는 기본 타입 캐스팅 없이 반환된 값을 그대로 할당합니다. 대표적인 사용 사례는 Passport.js 같은 인증 미들웨어가 `req.user`에 설정한 사용자를 바인딩하는 것입니다.

## 무엇을 쓸지 고르기

`@Virtual`과 `@Request`는 서로 다른 두 카테고리에 속하며, 한 필드는 이 중 하나만 가집니다. 둘을 함께 쓰면 라우트 등록 시점에 `@Request cannot be combined with @Virtual`이 발생하고, 둘 중 하나를 `@Body` 같은 소스 데코레이터와 함께 써도 똑같이 거부됩니다. 셋 다 "필드 값이 어디에서 오는가"라는 같은 질문에 답하기 때문입니다.

- 값이 원본 `Request` 객체에 있고 객체 자신의 필드가 바인딩되기 전에 읽어야 한다면 `@Request`를 씁니다.
- 값이 만들어지는 중인 객체의 다른 필드로부터 파생된다면 `@Virtual`을 씁니다.

`@Virtual`은 모든 소스 필드가 바인딩된 뒤에 실행되므로, 선언 순서와 상관없이 그 필드들을 읽을 수 있습니다. 순서에 영향을 받는 것은 다른 `@Virtual` 필드에 의존하는 `@Virtual` 필드뿐입니다.

## 사용 예시

```typescript
import express from 'express'
import passport from 'passport'
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { Body, Virtual, Request, bindingCargo, getCargo } from 'express-cargo'

class OrderExample {
    @Body('price')
    price!: number

    @Body('quantity')
    quantity!: number

    // 요청에는 존재하지 않는 계산 필드
    @Virtual((obj: OrderExample) => obj.price * obj.quantity)
    total!: number
}

class PassportExample {
    @Request<object>(req => req.user!)
    user!: object
}

const EXAMPLE_TOKEN = 'express-cargo-token'

passport.use(
    new BearerStrategy((token, done) => {
        if (token !== EXAMPLE_TOKEN) {
            return done(null, false)
        }

        return done(null, { id: 'test-user-id', role: 'admin' })
    }),
)

const app = express()
app.use(express.json())
app.use(passport.initialize())

app.post('/orders', bindingCargo(OrderExample), (req, res) => {
    const orderData = getCargo<OrderExample>(req)
    res.json({
        message: '가상 필드로 처리된 주문 데이터!',
        data: orderData,
    })
})

app.get('/passport', passport.authenticate('bearer', { session: false }), bindingCargo(PassportExample), (req, res) => {
    const cargo = getCargo<PassportExample>(req)
    res.json(cargo)
})
```

Passport 인증은 `bindingCargo()`보다 먼저 실행해야 합니다. 인증에 성공하면 Passport가 `req.user`를 설정하고, `@Request<object>`가 해당 객체를 `PassportExample.user`에 바인딩합니다. 인증 정보가 없거나 유효하지 않으면 cargo 바인딩 전에 Passport가 요청을 거부합니다.

```shell
curl 'http://localhost:3000/passport' \
    -H 'Authorization: Bearer express-cargo-token'
```

```json
{
    "user": {
        "id": "test-user-id",
        "role": "admin"
    }
}
```

`object`를 사용하면 특정 사용자 모델에 의존하지 않습니다. 애플리케이션 코드에서 `user.id` 같은 필드에 접근해야 한다면 `object`를 구체적인 사용자 타입으로 바꾸고 해당 타입을 `@Request<T>`에 전달합니다.
