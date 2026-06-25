# 处理嵌套请求

此示例展示 **Express-Cargo** 如何填充嵌套 Requests，让你可以将复杂且结构化的请求数据映射到一个组织良好的对象中。

## 1. 定义你的 Requests

在此场景中，我们将定义两个类：`UserInfoRequest` 和 `OrderRequest`。`UserInfoRequest` 类从请求 body 中提取用户详情，并从 headers 中提取认证 token。

**`UserInfoRequest`** - 将用户详情映射自请求 body，并从 headers 中提取授权 token。

```typescript
// user.request.ts
import { Body, Header, Optional, Prefix, Transform } from 'express-cargo'

export class UserInfoRequest {
    @Body('name')
    name!: string

    @Body('email')
    @Prefix('user-')
    email!: string

    @Body('age')
    @Optional()
    age?: number

    // 从 Authorization header 中提取 token。
    @Header('authorization')
    @Transform((value: string) => {
        if (value.startsWith('Bearer ')) {
            return value.substring(7);
        }
        return ''
    })
    authorization!: string
}
```

**`OrderRequest`** - 表示订单请求，其中包含一个嵌套的 `UserInfoRequest`。

```typescript
// order.request.ts
import { Body, Min, Max } from 'express-cargo'
import { UserInfoRequest } from './user.request'

export class OrderRequest {
    @Body('productId')
    productId!: string

    @Body('quantity')
    @Min(1)
    @Max(10)
    quantity!: number

    @Body('user')
    user!: UserInfoRequest
}
```

在 `UserInfoRequest` 中，我们在 `authorization` 属性上使用 `@header` 装饰器，从 `Authorization` header 获取值。然后，`@transform` 装饰器只提取 token 值，并移除 `"Bearer "` 前缀。

## 2. 在 Express 路由中使用

只需把 `bindingCargo` 中间件应用到路由，并传入顶层 Request：`OrderRequest`。中间件会为你处理所有绑定逻辑。

```typescript
router.post('/orders', bindingCargo(OrderRequest), (req, res) => {
    const order = getCargo<OrderRequest>(req)

    if (order) {
        console.log(`Processing order for product: ${order.productId}`)
        console.log(`User name: ${order.user.name}`)
        console.log(`Auth token: ${order.user.authorization}`)

        // 现在可以使用 auth token 执行验证或其他逻辑。
        res.json({ message: 'Order received', order })
    }
})
```

## 3. 示例请求

该路由可以成功处理同时包含 body 和 `Authorization` header 的请求。

- Request Body:
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

- Request Headers:

    ```
    Authorization: Bearer my-auth-token-12345
    ```

处理后，`getCargo(req)` 将返回一个包含所有数据的 `OrderRequest` 对象，并且 `authorization` 属性会正确填充为 header 中的值。这展示了 **Express-Cargo** 如何优雅地将多个数据来源统一成一个清晰对象。

## 4. 示例结果

最终绑定得到的 `OrderRequest` 对象：

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
