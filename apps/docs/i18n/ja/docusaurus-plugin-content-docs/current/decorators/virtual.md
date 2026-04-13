# 仮想フィールドデコレータ

**Express-Cargo** は、**仮想フィールド**と**リクエスト派生フィールド**を定義するためのデコレータを提供します。これらのデコレータにより、値を動的に計算したり、`Request` からオブジェクトプロパティにデータを直接マッピングしたりできます。

## 組み込み仮想デコレータ

### `@Virtual<T>(transformer: (obj: object) => T)`

`@Virtual` デコレータは、リクエストから直接取得されない**計算プロパティ**を定義します。代わりに、その値はオブジェクトの他のプロパティから導出されます。

- **`transformer`**: オブジェクトインスタンスを受け取り、計算された値を返す関数

### `@Request<T>(transformer: (req: Request) => T)`

`@Request` デコレータは、Express の `Request` オブジェクトからクラスプロパティに値をマッピングします。

- **`transformer`**: Request オブジェクトを受け取り、バインドする値を返す関数。

## 使用例

```typescript
import express from 'express'
import { Body, Virtual, Request, bindingCargo, getCargo } from 'express-cargo'

// 1. 仮想フィールドとリクエスト派生フィールドを持つオブジェクトを定義
class OrderExample {
    @Body('price')
    price!: number

    @Body('quantity')
    quantity!: number

    // リクエストに存在しない計算フィールド
    @Virtual((obj: OrderExample) => obj.price * obj.quantity)
    total!: number
}

class HeaderExample {
    // リクエストオブジェクトから直接派生したフィールド
    @Request(req => req.headers['x-custom-header'] as string)
    customHeader!: string
}

// 2. Express アプリとルートをセットアップ
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
これらのエンドポイントをテストするには、関連するボディまたはヘッダーを含む POST リクエストを送信します：

/orders のボディ例:
{
    "price": 50,
    "quantity": 2
}

/headers のヘッダー例:
x-custom-header: my-header-value
*/
```