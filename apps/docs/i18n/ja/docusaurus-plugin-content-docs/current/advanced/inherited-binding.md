## 継承バインディング

フィールドデコレータは、親クラスで宣言されたフィールドにも適用されます。
これにより、**ベースクラス**で共通フィールドを定義し、**子クラス**で拡張またはオーバーライドできます。

### 例
```typescript
class BaseRequest {
  @Body()
  @Length(10)
  id!: string
}

class CreateUserRequest extends BaseRequest {
  @Body()
  @OneOf(["admin", "user"])
  role!: string
}
```

### 結果
`CreateUserRequest` は以下のフィールドを持ちます：

- id : `BaseRequest` から継承

- role : `CreateUserRequest` で定義