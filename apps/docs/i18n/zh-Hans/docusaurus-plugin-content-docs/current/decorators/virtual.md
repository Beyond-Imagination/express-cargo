# 虚拟字段装饰器

**Express-Cargo** 提供用于定义**虚拟字段**和**请求派生字段**的装饰器。这些装饰器允许你动态计算值，或将 `Request` 中的数据直接映射到对象属性。

## 内置虚拟装饰器

### `@Virtual<T>(transformer: (obj: object) => T)`

`@Virtual` 装饰器定义一个**计算属性**，该属性并不直接来自请求。它的值由对象的其他属性派生而来。

- **`transformer`**：接收对象实例并返回计算值的函数。

### `@Request<T>(transformer: (req: Request) => T)`

`@Request` 装饰器将 Express `Request` 对象中的值映射到类属性。

- **`transformer`**：接收 Request 对象并返回要绑定值的函数。

## 使用示例

```typescript
import express from 'express'
import { Body, Virtual, Request, bindingCargo, getCargo } from 'express-cargo'

// 1. 定义包含虚拟字段和请求派生字段的对象
class OrderExample {
    @Body('price')
    price!: number

    @Body('quantity')
    quantity!: number

    // 请求中不存在的计算字段
    @Virtual((obj: OrderExample) => obj.price * obj.quantity)
    total!: number
}

class HeaderExample {
    // 直接从请求对象派生的字段
    @Request(req => req.headers['x-custom-header'] as string)
    customHeader!: string
}

// 2. 设置 Express 应用和路由
const app = express()
app.use(express.json())

app.post('/orders', bindingCargo(OrderExample), (req, res) => {
    const orderData = getCargo<OrderExample>(req)
    res.json({
        message: 'Order data processed with virtual fields!',
        data: orderData
    })
})

app.post('/headers', bindingCargo(HeaderExample), (req, res) => {
    const headerData = getCargo<HeaderExample>(req)
    res.json({
        message: 'Header data mapped using @request!',
        data: headerData
    })
})

/*
要测试这些端点，请使用相关 body 或 headers 发送 POST 请求：

/orders body 示例：
{
    "price": 50,
    "quantity": 2
}

/headers headers 示例：
x-custom-header: my-header-value
*/
```
