# ネストされたリクエストの処理

この例では、**Express-Cargo** がネストされたリクエストをどのように処理し、複雑な構造化されたリクエストデータを単一の整理されたオブジェクトにマッピングできるかを示します。

## 1. リクエストの定義

このシナリオでは、`UserInfoRequest` と `OrderRequest` の 2 つのクラスを定義します。`UserInfoRequest` クラスはリクエストボディからユーザー詳細を取得し、ヘッダーから認証トークンを取得します。

**`UserInfoRequest`** – リクエストボディからユーザー詳細をマッピングし、ヘッダーから認証トークンを抽出します。

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

    // Authorization ヘッダーからトークンを抽出
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

**`OrderRequest`** – ネストされた `UserInfoRequest` を含む注文リクエストを表します。

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

`UserInfoRequest` では、`authorization` プロパティに `@header` デコレータを使用して `Authorization` ヘッダーから値を取得します。次に、`@transform` デコレータが `"Bearer "` プレフィックスを除去してトークン値のみを抽出します。

## 2. Express ルートでの使用

トップレベルのリクエスト `OrderRequest` を使用して、ルートに `bindingCargo` ミドルウェアを適用するだけです。ミドルウェアがすべてのバインディングロジックを処理します。

```typescript
router.post('/orders', bindingCargo(OrderRequest), (req, res) => {
    const order = getCargo<OrderRequest>(req)

    if (order) {
        console.log(`Processing order for product: ${order.productId}`)
        console.log(`User name: ${order.user.name}`)
        console.log(`Auth token: ${order.user.authorization}`)

        // 認証トークンをバリデーションやその他のロジックに使用できます
        res.json({ message: 'Order received', order })
    }
})
```

## 3. リクエスト例

このルートは、ボディと `Authorization` ヘッダーの両方を持つリクエストを正常に処理します。

- リクエストボディ:
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

- リクエストヘッダー:

    ```
    Authorization: Bearer my-auth-token-12345
    ```

処理後、`getCargo(req)` はすべてのデータを含む単一の `OrderRequest` オブジェクトを返し、`authorization` プロパティはヘッダーから正しく取得されます。これは、**Express-Cargo** が複数のデータソースを一つのクリーンなオブジェクトにエレガントに統合する方法を示しています。

## 4. 結果例

最終的にバインドされた `OrderRequest` オブジェクト:

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