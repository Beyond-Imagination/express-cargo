# デコレータの概要

## デコレータとは？
express-cargo のデコレータは、クラスフィールドにアノテーションを付与し、ミドルウェアに以下を伝えます：

- データの抽出元（例: ボディ、クエリ）
- バリデーション方法
- データの変換方法

クラスを `bindingCargo` に渡すと、ミドルウェアはこれらのデコレータを読み取り、`getCargo` で取得できる型安全なオブジェクトを構築・検証・変換します。

## デコレータのカテゴリ

デコレータは、バインディングパイプラインで果たす役割ごとにグループ化されます。

| カテゴリ              | 目的                             | 例                                                                                               | 参照                                                                     |
|-------------------|--------------------------------|-------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| **Source**        | フィールドの値の取得元を選択する               | `@Body`, `@Query`, `@Header`, `@Uri` / `@Params`, `@Session`, `@UploadedFile`, `@UploadedFiles` | [ソースデコレータ](./source-decorators.md)、[ファイルアップロードデコレータ](./file-upload.md) |
| **Request**       | Express の `Request` から値を直接読み取る | `@Request`                                                                                      | [仮想フィールドデコレータ](./virtual.md)                                           |
| **Virtual**       | オブジェクトの他のフィールドからフィールドを計算する     | `@Virtual`                                                                                      | [仮想フィールドデコレータ](./virtual.md)                                           |
| **Transform**     | バインド前に単一フィールドの値を変更する           | `@Transform`                                                                                    | [変換デコレータ](./transforms.md)                                             |
| **Type helper**   | 生の値をどう解釈し変換するかを決定する            | `@Type`, `@List`, `@Enum`                                                                       | [型ヘルパーデコレータ](./type-helpers.md)                                        |
| **Validation**    | フィールドの値にルールを適用する               | `@Min`, `@Max`, `@Email`, `@OneOf`, …                                                           | [バリデーションデコレータ](./validators.md)                                        |
| **Missing-value** | フィールドが存在しない場合の動作を決定する          | `@Default`, `@Optional`                                                                         | [欠落フィールドの処理](./missing-fields.md)                                      |

**Source**・**Request**・**Virtual** は「このフィールドの値はどこから来るのか」という同じ問いに答えるため、各フィールドはこのうち必ず 1 つだけを持ち、併用できません。`@UploadedFile` と `@UploadedFiles` は multipart パーサーの出力を読むソースデコレータです。そのため 1 つのフィールドに `@UploadedFile` と `@Body` を付けると、`@Body` と `@Query` の場合と同じように拒否されます。

`@Type` と `@List` のより高度なシナリオ（多態性、循環参照、独自クラスの配列）については、**高度な使い方** の [型変換と多態性](../advanced/type-and-polymorphism.md) と [List デコレータ](../advanced/list-decorator.md) を参照してください。

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

制限はカテゴリ間ではなくカテゴリ内に働きます。1 つのフィールドが取れるのはソース 1 つ、型ヘルパー 1 つ、値なし処理 1 つで、バリデーションデコレータは自由に重ねられます。`bindingCargo()` はこれらのルールをルート登録時に検査し、サーバーがリクエストを処理する前に `CargoSchemaError` を投げます。

各カテゴリは、上記でリンクされた個別のページで説明されています。
