## 組み込みデコレータ

| デコレータ    | ソース        |
|--------------|---------------|
| `@Body()`    | `req.body`    |
| `@Query()`   | `req.query`   |
| `@Header()`  | `req.headers` |
| `@Uri()`     | `req.params`  |
| `@Params()`  | `req.params`  |
| `@Session()` | `req.session` |

## デコレータの詳細

### `@Body()`

HTTP リクエストボディからデータを抽出し、対応するフィールドにバインドします。

- ソース: `req.body`

---

### `@Query()`

HTTP リクエストのクエリパラメータからデータを抽出し、対応するフィールドにバインドします。

- ソース: `req.query`

---

### `@Header()`

HTTP リクエストヘッダーから値を抽出し、対応するフィールドにバインドします。
認証トークン（`Authorization`）やカスタムヘッダーなどのリクエストメタデータに DTO から直接アクセスする際によく使用されます。

- ソース: `req.headers`

---

### `@Uri()` / `@Params()`

HTTP リクエスト URL からパス変数を抽出し、対応するフィールドにバインドします。
REST API でリソース識別子（`id` など）を DTO の一部として受け取る際に使用されます。

両方のデコレータは内部的に同じ動作を行い、`@Uri()` は `@Params()` のエイリアスです。

- ソース: `req.params`
- `/users/:id`、`/posts/:postId` などのルートで一般的に使用されます

---

### `@Session()`

セッションに保存された値を抽出し、DTO フィールドにバインドします。
認証済みユーザー情報などのサーバーサイドの状態を DTO に渡す際に便利です。

- ソース: `req.session`
- セッションミドルウェアが設定されている場合のみ使用可能

---

## 使用例

Express アプリケーション内でソースデコレータを使用する例です。

```typescript
class Request {
    @Body('email')
    email!: string

    @Query('limit')
    limit!: number

    @Header('Authorization')
    authorization!: string
}
```
