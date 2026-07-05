# 基本的な使い方

この例では、**express-cargo** の最もシンプルなエンドツーエンドの流れを示します。リクエストクラスを定義し、`bindingCargo` ミドルウェアでバインドし、検証済みの結果を `getCargo` で読み取ります。

> このページはバインドの流れのみに焦点を当てています。プロジェクトのセットアップ（TypeScript、`tsconfig`、依存関係のインストール）については、[はじめに](../getting-started.md)を参照してください。

## 1. リクエストクラスを定義する

クラスを宣言し、ソースデコレータ（ここでは `@Body()`）を使って各フィールドを受信リクエストの一部にマッピングします。

```typescript
// create-user.request.ts
import { Body } from 'express-cargo'

export class CreateUserRequest {
    @Body('name')
    name!: string

    @Body('email')
    email!: string
}
```

## 2. ミドルウェアを適用する

リクエストクラスを `bindingCargo` に渡し、ルートのミドルウェアとして登録します。ミドルウェアは、ハンドラが実行される前にリクエストをバインドして検証します。

```typescript
import express from 'express'
import { bindingCargo, getCargo } from 'express-cargo'
import { CreateUserRequest } from './create-user.request'

const app = express()
app.use(express.json())

app.post('/users', bindingCargo(CreateUserRequest), (req, res) => {
    // 3. バインドされた型安全なオブジェクトを読み取る
    const user = getCargo<CreateUserRequest>(req)

    res.json({
        message: 'User created!',
        data: user,
    })
})
```

## 3. リクエスト例

```json
{
    "name": "Jane Doe",
    "email": "jane@example.com"
}
```

## 4. 結果例

`getCargo<CreateUserRequest>(req)` は、完全に値が設定された `CreateUserRequest` のインスタンスを返します。

```json
{
    "message": "User created!",
    "data": {
        "name": "Jane Doe",
        "email": "jane@example.com"
    }
}
```

## 次のステップ

- 他のソースからデータを取得する（`@Query`、`@Header`、`@Params`）— [ソースデコレータ](../decorators/source-decorators.md)を参照
- `@Min`、`@Email` などのバリデーションルールを追加する — [バリデーションデコレータ](../decorators/validators.md)を参照
- ネストしたオブジェクトをバインドする — [ネストしたリクエストの処理](./nested-request.md)を参照
- バリデーション失敗を処理する — [エラー処理](./validation-errors.md)を参照
