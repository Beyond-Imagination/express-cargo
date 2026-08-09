# 継承バインディング

フィールドデコレータは、親クラスで宣言されたフィールドにも適用されます。  
これにより、共通フィールドを**ベースクラス**で一度定義し、**子クラス**全体で再利用できます。

## 例
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

## 結果
`CreateUserRequest` は以下のフィールドを持ちます：

- id : `BaseRequest` から継承

- role : `CreateUserRequest` で定義

`CreateUserRequest` を `bindingCargo` に渡すと、継承された `id` とローカルで宣言された `role` の両方がまとめてバインドされ、検証されます。

## 継承したフィールドの再宣言

子クラスで継承したフィールドを再宣言しても、親クラスの定義は置き換えられ**ません**。両方のクラスのデコレータが同じフィールドにマージされます。この方法でソースデコレータを再適用すると（たとえば、親クラスが既に `@Body()` でソースにしているフィールドに `@Body()` を付けると）、スキーマエラーが発生します。

```
Update.id: @Body + @Body cannot be combined; pick a single source
```

したがって、各フィールドは単一のクラスで宣言してください。フィールドのバインド方法や検証方法を変更するには、サブクラスで再宣言するのではなく、最初に宣言した場所で編集してください。

## 注意点

- フィールドはプロトタイプチェーン全体にわたって収集されるため、複数レベルの継承がサポートされます。
