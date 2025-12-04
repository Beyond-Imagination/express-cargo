---
id: nested-request
title: 중첩 요청 처리
---

# 중첩 요청 처리하기

이 예제는 **Express-Cargo**가 중첩된 요청을 채워 넣어, 복잡하고 구조화된 요청 데이터를 하나의 잘 구성된 객체로 매핑하는 방법을 보여줍니다.

## 1. Request 정의하기

이 시나리오에서는 `UserInfoRequest`와 `OrderRequest` 두 클래스를 정의합니다. `UserInfoRequest` 클래스는 요청 본문에서 사용자 정보를 가져오고, 요청 헤더에서 인증 토큰을 추출합니다.

**`UserInfoRequest`** – 요청 본문에서 사용자 정보를 매핑하고, 헤더에서 Authorization 토큰을 추출합니다.

```typescript
// user.request.ts
import { Body, Header, Optional, prefix, Transform } from 'express-cargo'

export class UserInfoRequest {
    @Body('name')
    name!: string

    @Body('email')
    @prefix('user-')
    email!: string

    @Body('age')
    @Optional()
    age?: number

    // Authorization 헤더에서 토큰 추출
    @Header('authorization')
    @Transform((value: string) => {
        if (value.startsWith('Bearer ')) {
            return value.substring(7);
        }
    })
    authorization!: string
}
```

**`OrderRequest`** – 주문 요청을 표현하며, 중첩된 `UserInfoRequest`를 포함합니다.

```typescript
// order.request.ts
import { Body, min, max } from 'express-cargo'
import { UserInfoRequest } from './user.request'

export class OrderRequest {
    @Body('productId')
    productId!: string

    @Body('quantity')
    @min(1)
    @max(10)
    quantity!: number

    @Body('user')
    user!: UserInfoRequest
}
```

`UserInfoRequest`에서 `@header` 데코레이터를 사용해 `authorization` 속성을 `Authorization` 헤더 값으로 채웁니다. 그 다음, `@transform` 데코레이터로 `"Bearer "` 접두사를 제거하고 토큰 값만 추출합니다.

## 2. Express 라우트에서 사용하기

라우트에 최상위 Request인 `OrderRequest`와 함께 `bindingCargo` 미들웨어를 적용하면, 모든 바인딩 로직이 자동으로 처리됩니다.

```typescript
router.post('/orders', bindingCargo(OrderRequest), (req, res) => {
    const order = getCargo<OrderRequest>(req)

    if (order) {
        console.log(`주문 처리 중인 상품: ${order.productId}`)
        console.log(`사용자 이름: ${order.user.name}`)
        console.log(`인증 토큰: ${order.user.authorization}`)
    
        // 이제 인증 토큰을 검증하거나 다른 로직에 활용할 수 있습니다.
        res.json({ message: '주문이 접수되었습니다', order })
    }
})
```

## 3. 요청 예시

이 라우트는 요청 본문과 `Authorization` 헤더를 모두 포함한 요청을 처리할 수 있습니다.

- 요청 본문:
    ```json
    {
        "productId": "SKU-456",
        "quantity": 5,
        "user": {
            "name": "Jane Doe",
            "email": "user-jane@example.com"
        }
    }
    ```

- 요청 헤더:

    ```
    Authorization: Bearer my-auth-token-12345
    ```

처리 후 `getCargo(req)`는 모든 데이터를 포함한 단일 `OrderRequest` 객체를 반환하며, `authorization` 속성은 헤더에서 추출한 토큰 값으로 올바르게 채워집니다. 이를 통해 **Express-Cargo**가 여러 데이터 소스를 하나의 깔끔한 객체로 통합하는 모습을 확인할 수 있습니다.

## 4. 결과 예시

최종 바인딩된 `OrderRequest` 객체:

```json
{
    "productId": "SKU-456",
    "quantity": 5,
    "user": {
        "name": "Jane Doe",
        "email": "user-jane@example.com",
        "authorization": "my-auth-token-12345"
    }
}
```
