# 型ヘルパーデコレータ

型ヘルパーは、バリデーションが実行される前に **フィールドの値をどう解釈するか** をバインダーに伝えます。ネストされたオブジェクトがどのクラスになるか、配列の各要素がどの型に変換されるか、生の文字列がどの enum メンバーに対応するかを決めます。

`@Type`、`@List`、`@Enum` は 1 つのカテゴリを形成します。1 つのフィールドに適用できるのはこのうち最大 1 つです。

## `@Type(typeFn: TypeThunk | TypeResolver, options?: TypeOptions)`

プレーンな JSON オブジェクトを対象クラスのインスタンスに変換します。

- **`typeFn`**: 対象クラスを返す関数。固定の型にはサンク `() => Class` を、生データからクラスを選ぶ場合はリゾルバ `(data) => Class` を使います。
- **`options.discriminator`**（オプション）: `{ property, subTypes: [{ name, value }] }` の形式の構造的マッピング。`property` の値によってクラスが選ばれます。

`@Type` は `String`・`Number`・`Boolean` のフィールドには適用できません。

```typescript
class User {
    @Body()
    @Type(() => Profile)
    profile!: Profile
}
```

ネストマッピング、循環参照、動的解決については [型変換と多態性](../advanced/type-and-polymorphism.md) を参照してください。

## `@List(elementType: ArrayElementType)`

配列フィールドの要素型を宣言し、各要素を個別に変換します。

- **`elementType`**: `String`、`Number`、`Boolean`、`Date`、クラスコンストラクタ、または文字列リテラル `'string'`、`'number'`、`'boolean'`、`'date'` のいずれか。

`@List` は配列フィールドにのみ適用できます。

```typescript
class ListSample {
    @Body()
    @List(Number)
    scores!: number[]
}
```

完全な例は [List デコレータ](../advanced/list-decorator.md) を参照してください。

## `@Enum(enumObj: object, message?: string)`

入力値を `enumObj` のメンバーにマッピングし、メンバーでない値は拒否します。

- **`enumObj`**: マッピング先の enum オブジェクト。
- **`message`**（オプション）: 値がメンバーでないときに表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

enum のキー（`'ADMIN'`）と値（`'admin'`、`0`）のどちらも入力として受け付けられ、バインドされたフィールドには常に enum の値が入ります。数値文字列は数値として比較されるため、`'0'` は値が `0` のメンバーに一致します。

```typescript
enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

class UpdateRoleRequest {
    @Body('role')
    @Enum(UserRole)
    role!: UserRole
}
```

`@Enum` は値の変換と検査の両方を行いますが、[バリデーションデコレータ](./validators.md) ではなく **型ヘルパー** です。ここから 2 つの帰結が生まれます。

- `@Each` が包めるのはバリデーションデコレータだけなので、`@Each(Enum(UserRole))` は拒否されます。
- `@Enum` は独自のトランスフォーマーをインストールするため、`@Transform` とは併用できません。

## スキーマルール

`bindingCargo()` は以下のルールを、最初のリクエスト時ではなくルート登録時に検査します。違反があれば起動時に `CargoSchemaError` を投げます。

| ルール                     | 違反メッセージ                                                                        |
|-------------------------|--------------------------------------------------------------------------------|
| 1 つのフィールドに型ヘルパーは 1 つだけ  | `@List + @Type cannot be combined; apply a single one of @Type/@List/@Enum`    |
| `@List` は配列フィールドが必要     | `@List can only be applied to array fields`                                    |
| `@Type` はプリミティブフィールドを拒否 | `@Type cannot be applied to a primitive field`                                 |
| `@Each` は型ヘルパーを包めない     | `@Each cannot wrap type-helper decorator(s): @Enum`                            |
| トランスフォーマーは `@Enum` が持つ  | `@Enum cannot be combined with @Transform; @Enum installs its own transformer` |

メッセージには実際に適用したデコレータが評価順（下から上）に並ぶため、先頭部分は書いたコードによって変わります。
