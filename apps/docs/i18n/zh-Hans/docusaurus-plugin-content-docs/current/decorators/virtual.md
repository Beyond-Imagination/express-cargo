# 虚拟字段装饰器

**Express-Cargo** 提供用于定义**虚拟字段**和**请求派生字段**的装饰器。这些装饰器允许你动态计算值，或将 `Request` 中的数据直接映射到对象属性。

## 内置虚拟装饰器

### `@Virtual<T>(transformer: (obj: object) => T)`

`@Virtual` 装饰器定义一个**计算属性**，该属性并不直接来自请求。它的值由对象的其他属性派生而来。

- **`transformer`**：接收对象实例并返回计算值的函数。

### `@Request<T>(transformer: (req: Request) => T)`

`@Request` 装饰器将 Express `Request` 对象中的值映射到类属性。

- **`transformer`**：接收 Request 对象并返回要绑定值的函数。

`@Request` 会按原样赋值，不执行内置类型转换。一个常见用法是绑定 Passport.js 等认证中间件设置在 `req.user` 上的用户对象。

## 使用示例

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

    // 请求中不存在的计算字段
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
        message: 'Order data processed with virtual fields!',
        data: orderData,
    })
})

app.get('/passport', passport.authenticate('bearer', { session: false }), bindingCargo(PassportExample), (req, res) => {
    const cargo = getCargo<PassportExample>(req)
    res.json(cargo)
})
```

Passport 认证必须在 `bindingCargo()` 之前运行。认证成功后，Passport 会设置 `req.user`，随后 `@Request<object>` 将该对象绑定到 `PassportExample.user`。如果凭据缺失或无效，Passport 会在 cargo 绑定前拒绝请求。

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

使用 `object` 可使示例不依赖特定的用户模型。如果应用代码需要访问 `user.id` 等属性，请将 `object` 替换为具体的用户类型，并将该类型传给 `@Request<T>`。
