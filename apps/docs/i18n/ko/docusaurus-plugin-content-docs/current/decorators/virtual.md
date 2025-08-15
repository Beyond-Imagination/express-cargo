---
id: virtual
title: 가상 필드 
---

# 가상 필드 데코레이터 (Virtual Field Decorators)

**Express-Cargo**는 **가상 필드(virtual fields)**와 **요청 기반 필드(request-derived fields)**를 정의할 수 있는 데코레이터를 제공합니다. 이 데코레이터들을 사용하면 값이 동적으로 계산되거나, 요청 객체에서 직접 DTO 속성으로 매핑될 수 있습니다.

## Built-in Virtual Decorators

### `@virtual<T>(transformer: (obj: object) => T)`

`@virtual` 데코레이터는 **계산된 속성(computed property)**을 정의합니다. 이 속성은 요청에서 직접 가져오는 것이 아니라, 객체의 다른 속성을 기반으로 값을 계산합니다.

- **`transformer`**: 객체 인스턴스를 받아 계산된 값을 반환하는 함수

### `@request<T>(transformer: (req: Request) => T)`

`@request` 데코레이터는 Express `Request` 객체에서 값을 가져와 클래스 속성에 바인딩합니다.

- **`transformer`**: 요청 객체를 받아 바인딩할 값을 반환하는 함수

## 사용 예시

```typescript
import express, { Request, Response } from 'express'
import { body, virtual, request, bindingCargo, getCargo } from 'express-cargo'

// 1. 가상 필드와 요청 기반 필드가 포함된 DTO 정의
class OrderDto {
    @body('price')
    price!: number

    @body('quantity')
    quantity!: number

    // 요청에는 존재하지 않는 계산 필드
    @virtual(obj => obj.price * obj.quantity)
    total!: number
}

class HeaderDto {
    // 요청 객체에서 직접 가져오는 필드
    @request(req => req.headers['x-custom-header'] as string)
    customHeader!: string
}

// 2. Express 앱과 라우트 설정
const app = express()
app.use(express.json())

app.post('/orders', bindingCargo(OrderDto), (req: Request, res: Response) => {
    const orderData = getCargo<OrderDto>(req)
    res.json({
        message: '가상 필드로 처리된 주문 데이터!',
        data: orderData
    })
})

app.post('/headers', bindingCargo(HeaderDto), (req: Request, res: Response) => {
    const headerData = getCargo<HeaderDto>(req)
    res.json({
        message: '요청 기반 필드(@request)로 매핑된 헤더 데이터!',
        data: headerData
    })
})

/*
이 엔드포인트들을 테스트하려면 POST 요청을 보내세요.

예시 /orders 요청 바디:
{
    "price": 50,
    "quantity": 2
}

예시 /headers 요청 헤더:
x-custom-header: my-header-value
*/
```
