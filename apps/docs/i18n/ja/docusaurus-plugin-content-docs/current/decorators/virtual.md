# 仮想フィールドデコレータ

**Express-Cargo** は、**仮想フィールド**と**リクエスト派生フィールド**を定義するためのデコレータを提供します。これらのデコレータにより、値を動的に計算したり、`Request` からオブジェクトプロパティにデータを直接マッピングしたりできます。

## 組み込み仮想デコレータ

### `@Virtual<T>(transformer: (obj: object) => T)`

`@Virtual` デコレータは、リクエストから直接取得されない**計算プロパティ**を定義します。代わりに、その値はオブジェクトの他のプロパティから導出されます。

- **`transformer`**: オブジェクトインスタンスを受け取り、計算された値を返す関数

### `@Request<T>(transformer: (req: Request) => T)`

`@Request` デコレータは、Express の `Request` オブジェクトからクラスプロパティに値をマッピングします。

- **`transformer`**: Request オブジェクトを受け取り、バインドする値を返す関数。

`@Request` は、組み込みの型キャストを行わず、返された値をそのまま代入します。代表的な使用例は、Passport.js などの認証ミドルウェアが `req.user` に設定したユーザーをバインドすることです。

## 使用例

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

    // リクエストに存在しない計算フィールド
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

Passport 認証は `bindingCargo()` より先に実行する必要があります。認証に成功すると Passport が `req.user` を設定し、`@Request<object>` がそのオブジェクトを `PassportExample.user` にバインドします。認証情報がない場合や無効な場合は、cargo のバインド前に Passport がリクエストを拒否します。

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

`object` を使用すると、例を特定のユーザーモデルに依存させずに済みます。アプリケーションコードで `user.id` などのプロパティにアクセスする必要がある場合は、`object` を具体的なユーザー型に置き換え、その型を `@Request<T>` に渡してください。
