# バリデーションデコレータ

Express-Cargo は、クラスにバインドされた受信リクエストデータを検証するためにデコレータを使用します。

バリデーションはスタンドアロンの `validate` 関数では実行されません。代わりに `bindingCargo` ミドルウェアに統合されており、リクエストライフサイクル中にデータを自動的に検証します。

## 組み込みバリデータ

### `@Optional()`

フィールドをオプションとしてマークし、省略または `undefined` に設定してもバリデーションエラーが発生しないようにします。

### `@Min(value: number)`

数値が指定された最小値以上であることを検証します。

- **`value`**: 許容される最小値。

### `@Max(value: number)`

数値が指定された最大値以下であることを検証します。

- **`value`**: 許容される最大値。

### `@Range(min: number, max: number)`

数値が指定された範囲内（最小値と最大値を含む）であることを検証します。

- **`min`**: 許容される最小値。
- **`max`**: 許容される最大値。

### `@Contains(seed: string)`

文字列に指定された部分文字列が含まれていることを検証します。

- **`seed`**: 文字列に含まれている必要がある部分文字列。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@Prefix(value: string)`

文字列が指定されたプレフィックスで始まることを検証します。

- **`value`**: 必須の先頭テキスト。

### `@Suffix(value: string)`

文字列が指定されたサフィックスで終わることを検証します。

- **`value`**: 必須の末尾テキスト。

### `@Equal(value: any)`

値が指定された値と厳密に等しい（`===`）ことを検証します。

- **`value`**: 比較対象の値。

### `@NotEqual(value: any)`

値が指定された値と厳密に等しくない（`!==`）ことを検証します。

- **`value`**: 比較対象の値。

### `@IsTrue()`

デコレートされたプロパティが true であることを検証します。

### `@IsFalse()`

デコレートされたプロパティが false であることを検証します。

### `@Length(value: number)`

デコレートされた文字列の長さが指定された値と正確に一致することを検証します。

- **`value`**: 必要な正確な文字数

### `@MaxLength(value: number)`

デコレートされた文字列の長さが指定された最大値を超えないことを検証します。

- **`value`**: 許容される最大文字数。

### `@MinLength(value: number)`

デコレートされた文字列の長さが指定された最小値以上であることを検証します。

- **`value`**: 許容される最小文字数。

### `@OneOf(values: any[])`

入力値が指定された値のいずれかであることを検証します。

- **`values`**: 許容される値の配列。

### `@ListContains(values: any[], comparator?: (expected, actual) => boolean, message?: string)`

配列に指定されたすべての値が含まれていることを検証します。プリミティブ値、オブジェクト、Date、および混合型をサポートします。

- **`values`**: 配列に含まれている必要がある値。
- **`comparator`**（オプション）: カスタム比較関数 `(expected, actual) => boolean`。指定すると、プリミティブを含むすべての比較がこの関数に委譲されます。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

> **警告**: オブジェクトの比較はデフォルトで深い等価性を使用します。`values` に多くのオブジェクトや深くネストされた構造が含まれている場合、パフォーマンスが低下する可能性があります。より効率的または柔軟な比較には `comparator` の使用を検討してください。

### `@ListNotContains(values: any[], comparator?: (expected, actual) => boolean, message?: string)`

配列に指定された値が一つも含まれていないことを検証します。プリミティブ値、オブジェクト、Date、および混合型をサポートします。

- **`values`**: 配列に含まれてはいけない値。
- **`comparator`**（オプション）: カスタム比較関数 `(expected, actual) => boolean`。指定すると、プリミティブを含むすべての比較がこの関数に委譲されます。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

> **警告**: オブジェクトの比較はデフォルトで深い等価性を使用します。`values` に多くのオブジェクトや深くネストされた構造が含まれている場合、パフォーマンスが低下する可能性があります。より効率的または柔軟な比較には `comparator` の使用を検討してください。

### `@Enum(enumObj: object, message?: string)`

入力値が指定された enum オブジェクトの値のいずれかに一致することを検証します。
また、入力値（例: 文字列キー）を対応する enum 値に自動的に変換します。

- **`enumObj`**: バリデーション対象の enum オブジェクト。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@Validate(validateFn: (value: unknown) => boolean, message?: string)`

カスタムバリデーション関数を使用して値を検証します。
このデコレータは、組み込みバリデーション以外のバリデーションロジックを実装する柔軟性を提供します。

- **`validateFn`**: フィールド値を受け取り、有効な場合は true、そうでない場合は false を返す関数。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@Regexp(pattern: RegExp, message?: string)`

デコレートされたフィールドが指定された正規表現パターンに一致することを検証します。
このデコレータは、メールアドレスや電話番号などの形式ルールを強制する際に便利です。

- **`pattern`**: フィールド値をテストするために使用される RegExp オブジェクト。パターンに一致する場合、値は有効です。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@Email()`

デコレートされたプロパティが有効なメールアドレスであることを検証します。

### `@Alpha(message?: string)`

デコレートされたフィールドがアルファベット文字のみ（英大文字または英小文字、A–Z / a–z）を含むことを検証します。

- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@Uuid(version?: 'v1' | 'v3' | 'v4' | 'v5', message?: string)`

デコレートされたフィールドが有効な UUID 文字列であることを検証します。オプションで特定のバージョン（v1、v3、v4、v5）に制限できます。

- **`version`**（オプション）: バリデーション対象の特定の UUID バージョン。省略すると、v1、v3、v4、v5 に対して検証されます。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@Alphanumeric(message?: string)`

デコレートされたフィールドが英数字のみ（英字と数字、A–Z、a–z、0–9）を含むことを検証します。

- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@IsUppercase(message?: string)`

デコレートされたフィールドが大文字のみを含むことを検証します。

- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@IsLowercase(message?: string)`

デコレートされたフィールドが小文字のみを含むことを検証します。

- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@IsJwt(message?: string)`

デコレートされたフィールドが JWT 形式（`header.payload.signature`）に従っていることを検証します。各部分は Base64URL 文字（A-Z、a-z、0-9、`-`、`_`）で構成されている必要があります。このデコレータは形式のみをチェックし、署名やトークンの有効性は検証しません。

- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@IsUrl(options?: IsUrlOptions, message?: string)`

デコレートされたフィールドが有効な URL であることを検証します。デフォルトでは、`http`、`https`、`ftp` プロトコルが許可されます。

- **`options`**（オプション）:
  - **`protocols`**: 許可されるプロトコルの配列。デフォルトは `['http', 'https', 'ftp']` です。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@IsPhoneNumber(region?: CountryCode, message?: string)`

デコレートされたフィールドが有効な電話番号であることを検証します。[libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) を使用して、全世界の国の番号を正確に検証します。

地域コードを指定すると、国番号なしのローカル形式も許可されます。地域コードを省略すると、国番号を含む国際形式（例: `+82`）が必要です。`+` で始まる番号は region パラメータに関係なく、番号自体の国コードで検証されます。

- **`region`**（オプション）: ISO 3166-1 alpha-2 地域コード（例: `'KR'`、`'US'`）。省略すると国際形式が要求されます。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@IsTimeZone(message?: string)`

デコレートされたフィールドが有効な IANA タイムゾーン識別子であることを検証します（例: `Asia/Seoul`、`America/New_York`、`UTC`）。Node.js 組み込みの `Intl` API を使用して検証するため、外部依存関係は不要です。

- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@IsHexColor(message?: string)`

デコレートされたフィールドが有効な16進カラーコードであることを検証します。`#RGB`、`#RGBA`、`#RRGGBB`、`#RRGGBBAA` 形式をサポートします（大文字小文字を区別しません）。`#` プレフィックスは必須です。

- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@IsHexadecimal(message?: string)`

デコレートされたフィールドが16進数であることを検証します。値は `0-9` と `a-f`（大文字小文字を区別しません）の文字のみを含む必要があります。`0x` プレフィックスも許可されます。

- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@IsHash(algorithm: HashAlgorithm, message?: string)`

デコレートされたフィールドが指定されたアルゴリズムの有効なハッシュ文字列であることを検証します。サポートされるアルゴリズム: `md5`、`sha1`、`sha256`、`sha384`、`sha512`、`crc32`、`crc32b`。値はアルゴリズムが要求する正確な長さの16進文字列である必要があります。

- **`algorithm`**: バリデーション対象のハッシュアルゴリズム。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@MinDate(min: Date | (() => Date), message?: string)`

デコレートされたフィールドが指定された最小日付以降の `Date` であることを検証します。固定の `Date` または動的比較のために `Date` を返す関数を受け付けます。

- **`min`**: 許容される最小日付、またはそれを返す関数。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@MaxDate(max: Date | (() => Date), message?: string)`

デコレートされたフィールドが指定された最大日付以前の `Date` であることを検証します。固定の `Date` または動的比較のために `Date` を返す関数を受け付けます。

- **`max`**: 許容される最大日付、またはそれを返す関数。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@With(fieldName: string, message?: string)`

デコレートされたフィールドに値がある場合、指定されたターゲットフィールド（fieldName）にも値が必要であることを検証し、2つのフィールド間の必須依存関係を確立します。

- **`fieldName`**: デコレートされたフィールドに値がある場合に、値を持つ必要があるターゲットフィールドの名前。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@Without(fieldName: string, message?: string)`

デコレートされたプロパティに値がある場合、指定されたターゲットプロパティには値があってはならないことを検証し、2つのプロパティ間の相互排他関係を確立します。

- **`fieldName`**: デコレートされたフィールドに値がある場合に、空でなければならないターゲットプロパティの名前。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@Each(...args: (Validator | Function)[])`

配列内の個々の要素をすべて検証します。他のバリデーションデコレータやカスタムバリデーション関数を受け付けることができます。

- `args`: バリデーションデコレータ（例: @Min(5)）またはカスタム関数 (value: any) => boolean。

### `@ListMaxSize(max: number, message?: string)`

配列の要素数が指定された数を超えないことを検証します。

- **`max`**: 配列で許容される最大要素数。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

### `@ListMinSize(min: number, message?: string)`

配列の要素数が指定された数以上であることを検証します。

- **`min`**: 配列で許容される最小要素数。
- **`message`**（オプション）: バリデーション失敗時に表示するエラーメッセージ。省略すると、デフォルトメッセージが使用されます。

## 使用例

Express アプリケーション内でバリデーションデコレータを使用する完全な例です。

```typescript
import express, { Request, Response, NextFunction } from 'express'
import { bindingCargo, getCargo, Body, Min, Max, Suffix, CargoValidationError } from 'express-cargo'

// 1. ソースとバリデーションルールを持つクラスを定義
class CreateAssetRequest {
    @Body('name')
    assetName!: string

    @Body('type')
    @Suffix('.png')
    assetType!: string

    @Body('quantity')
    @Min(1)
    @Max(100)
    quantity!: number
}

const app = express()
app.use(express.json())

// 2. ルートに bindingCargo ミドルウェアを適用
app.post('/assets', bindingCargo(CreateAssetRequest), (req: Request, res: Response) => {
    // 3. バリデーション成功時、getCargo でデータにアクセス
    const assetData = getCargo<CreateAssetRequest>(req)
    res.json({
        message: 'Asset created successfully!',
        data: assetData,
    })
})

// 4. バリデーションエラーをキャッチするエラーハンドリングミドルウェアを追加
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        res.status(400).json({
            message: 'Validation Failed',
            errors: err.errors.map(e => e.message),
        })
    } else {
        next(err)
    }
})

/*
このエンドポイントをテストするには、/assets に POST リクエストを送信します。

有効なリクエストボディの例:
{
    "name": "My-Asset",
    "type": "icon.png",
    "quantity": 10
}

無効なリクエストボディの例:
{
    "name": "My-Asset",
    "type": "icon.jpg", // @Suffix('.png') に失敗
    "quantity": 101     // @Max(100) に失敗
}
*/
```

## エラーハンドリング

バリデーション失敗時、`bindingCargo` ミドルウェアは `CargoValidationError` をスローします。このエラーをキャッチしてレスポンスをフォーマットするために、Express エラーハンドリングミドルウェアを登録する必要があります。

`CargoValidationError` オブジェクトには `errors` プロパティがあり、`CargoFieldError` インスタンスの配列を保持しています。各 `CargoFieldError` オブジェクトには、具体的なエラーを詳述するフォーマットされた文字列を含む `message` プロパティがあります（例: `"quantity: quantity must be <= 100"`）。

コード例に示されているように、一般的な処理方法は `err.errors` 配列をマップして、これらのエラーメッセージの簡潔なリストを作成することです。

**エラーレスポンスの例:**

上記の例の無効なリクエストボディが送信された場合、エラーハンドラはフォーマットされたエラーメッセージの配列を含む以下の JSON レスポンスを生成します。

```json
{
    "message": "Validation Failed",
    "errors": [
        "type: assetType must end with .png",
        "quantity: quantity must be <= 100"
    ]
}
```