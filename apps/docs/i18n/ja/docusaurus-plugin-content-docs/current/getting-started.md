## 🚀 express-cargo をはじめよう
このドキュメントは、**TypeScript + Express 環境で express-cargo を素早く体験するための**最小構成ガイドです。
例は **pnpm + Node.js 18 以降**をベースにしています。

---

### 1. 要件

- Node.js **18 以降（LTS 推奨）**

パッケージマネージャ: npm | yarn | pnpm
→ このドキュメントでは pnpm を使用します。

> express-cargo は Decorator + Metadata を使用するため、TypeScript を推奨します。

---

### 2. Node.js のインストール
以下の公式サイトからお使いの OS に適した LTS バージョンをインストールしてください。

- Node.js 公式ダウンロード
    https://nodejs.org


インストールの確認:
```shell
node -v
pnpm -v
```
成功すると、バージョンが表示されます。

---

### 3. 新しいプロジェクトの作成（pnpm）
#### pnpm
```shell
mkdir express-cargo-example
cd express-cargo-example
pnpm init
```

### 4. TypeScript 環境の設定
#### 4-1. TypeScript と開発依存関係のインストール
```shell
pnpm add -D typescript ts-node @types/node
```

#### 4-2. tsconfig.json の作成
```shell
pnpm tsc --init
```
#### 4-3. 推奨 tsconfig 設定
```json
{
  "compilerOptions": {
    ...,
    "experimentalDecorators": true,     // express-cargo 必須
    "emitDecoratorMetadata": true,      // 型メタデータを使用
    ...
  },
  ...
}
```

>⚠️ experimentalDecorators、emitDecoratorMetadata がないと、
> express-cargo のバリデーション/トランスフォーメーションが動作しません。

---

### 5. express & express-cargo のインストール
```shell
pnpm add express express-cargo
pnpm add -D @types/express
pnpm add reflect-metadata
```

---

### 6. 基本サーバー + express-cargo 設定
#### 6-1. `src/app.ts`

```typescript
import express from 'express'
import { bindingCargo, getCargo, Body, Query, Header, Params, Min, Max, Equal, NotEqual, Prefix, Suffix } from 'express-cargo'
import errorHandlerRouter from './errorHandler'

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(errorHandlerRouter)

app.listen(port, () => {console.log(`Example app listening on port ${port}`)})

class ExampleRequest {
  @Body() // リクエストボディからフィールドを抽出
  @Equal('1') // 値が "1" でない場合、バリデーションエラーが発生
  id!: string
}

app.post('/example', bindingCargo(ExampleRequest), (req, res) => { // bindingCargo(Class): Request → DTO 変換 + バリデーション
  const cargo = getCargo<ExampleRequest>(req) // バリデーション済みの型安全なオブジェクトを返す
  res.json(cargo)
})
```

### 7. 実行
```shell
npm run dev
```
テストリクエスト:

```
POST http://localhost:3000/example
Content-Type: application/json

{
  "id": "1"
}

```

レスポンス:

```
{ "id": "1" }
```

- ❌ `"id": "2"` → バリデーションエラーが発生