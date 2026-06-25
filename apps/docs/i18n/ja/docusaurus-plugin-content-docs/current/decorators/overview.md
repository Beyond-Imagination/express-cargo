# デコレータの概要

## デコレータとは？
express-cargo のデコレータは、クラスフィールドにアノテーションを付与し、ミドルウェアに以下を伝えます：

- データの抽出元（例: ボディ、クエリ）
- バリデーション方法
- データの変換方法

クラスを `bindingCargo` に渡すと、ミドルウェアはこれらのデコレータを読み取り、`getCargo` で取得できる型安全なオブジェクトを構築・検証・変換します。

## デコレータのカテゴリ

デコレータは、バインディングパイプラインで果たす役割ごとにグループ化されます。

| カテゴリ | 目的 | 例 | 参照 |
|----------|------|-----|------|
| **Source** | フィールドの値の取得元を選択する | `@Body`, `@Query`, `@Header`, `@Uri` / `@Params`, `@Session` | [ソースデコレータ](./source-decorators.md) |
| **Virtual** | 他のフィールドや生の `Request` からフィールドを計算する | `@Virtual`, `@Request` | [仮想フィールドデコレータ](./virtual.md) |
| **Transform** | バインド前に単一フィールドの値を変更する | `@Transform` | [変換デコレータ](./transforms.md) |
| **Validation** | フィールドの値にルールを適用する | `@Min`, `@Max`, `@Email`, `@OneOf`, … | [バリデーションデコレータ](./validators.md) |
| **Missing-value** | フィールドが存在しない場合の動作を決定する | `@Default`, `@Optional` | [欠落フィールドの処理](./missing-fields.md) |

その他のヘルパーは **高度な使い方** で扱います。たとえば、型付き配列用の [`@List`](../advanced/list-decorator.md) や、ネスト型・多態型用の [`@Type`](../advanced/type-and-polymorphism.md) などです。

## デコレータの組み合わせ

単一のフィールドは複数のカテゴリのデコレータを持つことができます。それらはまとめて読み取られ、そのフィールドのバインド・変換・検証が行われます。

```typescript
import { Body, Transform, MinLength } from 'express-cargo'

class CreateUserRequest {
    @Body('email')                              // Source: req.body.email から読み取る
    @Transform((value: string) => value.trim()) // Transform: 値を正規化する
    @MinLength(5)                               // Validation: ルールを適用する
    email!: string
}
```

各カテゴリは、上記でリンクされた個別のページで説明されています。
