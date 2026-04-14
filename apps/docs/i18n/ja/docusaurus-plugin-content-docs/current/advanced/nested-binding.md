# ネストされたオブジェクトバインディング

Express-Cargo は、リクエスト内のネストされたオブジェクトを処理し、再帰的な型キャストとバリデーションをサポートしながら、ネストされたオブジェクトに自動的にバインドできます。

## 使用例

```typescript
import express, { Request, Response } from 'express'
import { Body, bindingCargo, getCargo } from 'express-cargo'

// 1. ネストされたオブジェクトを定義
class Profile {
    @Body('nickname')
    nickname!: string
}

class ExampleObject {
    @Body('profile')
    profile!: Profile
}

// 2. Express アプリとルートをセットアップ
const app = express()
app.use(express.json())

app.post('/submit', bindingCargo(ExampleObject), (req: Request, res: Response) => {
    const requestData = getCargo<ExampleObject>(req)

    res.json({
        message: 'Nested bound successfully!',
        data: requestData,
    })
})

/*
このエンドポイントをテストするには、/submit に POST リクエストを送信します。

リクエスト URL の例:
http://localhost:3000/submit
*/
```

## 出力例

ネストされた profile オブジェクトを含む POST リクエストが送信されると、`bindingCargo` ミドルウェアが自動的にネストされた `ExampleObject` をインスタンス化し、バリデーションを行います。`getCargo` 関数はネストされたデータを含む完全なオブジェクトを返します：

```json
{
    "message": "Nested bound successfully!",
    "data": {
        "profile": {
            "nickname": "coder123"
        }
    }
}
```