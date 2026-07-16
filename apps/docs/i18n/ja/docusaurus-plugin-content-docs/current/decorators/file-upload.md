# ファイルアップロードデコレータ

Express-Cargo は `multipart/form-data` リクエストのファイルを、通常のフィールドと一緒に DTO へ直接バインドします。アップロードが取り得る2つの形を、2つのデコレータがカバーします。

- **`@UploadedFile()`** — 1つのフィールドの単一ファイル。
- **`@UploadedFiles()`** — 同じフィールド名を共有するすべてのファイルを配列として。

Express-Cargo は multipart ボディ自体を解析しません。パーサーミドルウェア（[multer](https://github.com/expressjs/multer) など）が `bindingCargo` の **前** に実行され、解析済みのファイルをリクエストに付与する必要があります。その後、Express-Cargo はそれらのファイルを見つけて **そのまま** バインドします — ファイルオブジェクトは変更されません。

## `@UploadedFile(key?: string)`

単一のアップロードファイルをバインドします。同じフィールド名を複数のファイルが共有する場合、最初のファイルがバインドされます。

- **`key`**: フォームフィールド名。デフォルトはプロパティ名です。

```typescript
class UploadAvatarRequest {
    @UploadedFile()
    avatar!: Express.Multer.File
}
```

## `@UploadedFiles(key?: string)`

同じフィールド名を共有するすべてのアップロードファイルを配列としてバインドします。

- **`key`**: フォームフィールド名。デフォルトはプロパティ名です。

```typescript
class UploadGalleryRequest {
    @UploadedFiles('photos')
    photos!: Express.Multer.File[]
}
```

## 使用例

multipart パーサーを設定し、`bindingCargo` より前のルートミドルウェアとして実行してから、DTO からバインドされたファイルを読み取ります。`@Body` などの通常のフィールドも、同じリクエストから通常どおりバインドされます。

```typescript
import express, { Request, Response } from 'express'
import multer from 'multer'
import { bindingCargo, getCargo, Body, UploadedFile, UploadedFiles } from 'express-cargo'

const upload = multer({ storage: multer.memoryStorage() })

// 1つのリクエストにテキストフィールドと単一ファイル
class UploadProfileRequest {
    @Body('bio')
    bio!: string

    @UploadedFile('avatar')
    avatar!: Express.Multer.File

    @UploadedFiles('gallery')
    gallery!: Express.Multer.File[]
}

const app = express()

// パーサーミドルウェアが最初に実行され、期待するフィールドを宣言し、
// その後 bindingCargo が解析済みファイルを DTO にマッピングします。
app.post(
    '/upload/profile',
    upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery' }]),
    bindingCargo(UploadProfileRequest),
    (req: Request, res: Response) => {
        const cargo = getCargo<UploadProfileRequest>(req)
        res.json({
            bio: cargo.bio,
            avatar: cargo.avatar.originalname,
            gallery: cargo.gallery.map(file => file.originalname),
        })
    },
)
```

パーサーミドルウェアがどのフィールドを受け付けるかを決定します。

| Multer 呼び出し                             | 対応するデコレータ                 |
|---------------------------------------------|-----------------------------------|
| `upload.single('avatar')`                   | `@UploadedFile('avatar')`         |
| `upload.array('photos')`                    | `@UploadedFiles('photos')`        |
| `upload.fields([{ name: 'avatar' }, ... ])` | 名前付きフィールドごとに1つ        |
| `upload.any()`                              | 上記のいずれか、フィールド名で照合 |

## ファイルの欠落

アップロードフィールドは、他のソースと同じ欠落値ルールに従います。そのフィールドにファイルが届かない場合:

- どちらのデコレータもない場合、`<field> is required` エラーでバインドが失敗します。
- [`@Optional()`](./missing-fields.md) がある場合、フィールドは `null` にバインドされ、そのバリデーションはスキップされます。
- [`@Default(value)`](./missing-fields.md) がある場合、フォールバック値が使用されます。

```typescript
class UploadRequest {
    @UploadedFile()
    @Optional()
    avatar?: Express.Multer.File
}
```

## `@Transform` は使用できません

ファイルはパーサーが生成したそのままバインドされるため、アップロードフィールドにユーザーの `@Transform` を付けても変換する対象がありません。両者を組み合わせると、起動時にスキーマエラーがスローされます。

```typescript
class UploadRequest {
    // ❌ 無効: ファイルはそのままバインドされ、変換できません
    @UploadedFile()
    @Transform((file: Express.Multer.File) => file)
    avatar!: Express.Multer.File
}
```

## 別のパーサーを使う

デフォルトでは、Express-Cargo は multer の `req.file` と `req.files` からファイルを読み取ります。リクエスト構造が異なるパーサー — 例えば、もう1つの広く使われている multipart パーサーである [formidable](https://github.com/node-formidable/formidable) — を統合するには、アプリケーション起動時に `setCargoFileLocator` でカスタム **ファイルロケーター** を一度登録します。これはすべてのルートに適用されるため、ロケーターは特定のフィールドを知る必要はなく、パーサーを一般的に適応させます。

ロケーターは Express `Request` を受け取り、アップロードされたファイルをフォームフィールド名ごとにまとめて返します — フィールド名をキーとする `Record<string, File[]>` です。formidable はミドルウェアではないため、リクエストを自分で解析して結果を付与すると、ロケーターがそれを Express-Cargo に渡します。

```typescript
import express, { Request, Response, NextFunction } from 'express'
import formidable, { File } from 'formidable'
import { setCargoFileLocator } from 'express-cargo'

// 1. formidable はミドルウェアではありません — リクエストを自分で解析して結果を付与します。
//    v3 では、`files` はすでにフィールド名ごとに配列がキー付けされています。
async function parseMultipart(req: Request, _res: Response, next: NextFunction) {
    const [, files] = await formidable().parse(req)
    ;(req as any).files = files // Record<string, File[]>
    next()
}

// 2. 起動時にロケーターを一度登録し、Express-Cargo がそれらのファイルを読み取れるようにします。
setCargoFileLocator((req: Request): Record<string, File[]> => (req as any).files ?? {})
```

すべてのフィールドは、単一ファイルを持つ場合でも **配列** にマッピングされます。`@UploadedFile()` はそのフィールド配列の最初の項目を、`@UploadedFiles()` は配列全体を取ります。パーサーに依存するのは位置検索ロジックのみで、ファイルオブジェクト自体は依然としてそのままバインドされます。

ファイルはそのままバインドされるため、その型とプロパティ名はパーサーに由来します。multer は `originalname` と `buffer` を、formidable は `originalFilename` と `filepath` を公開します。使用するパーサーのファイル型で各 DTO フィールドを型付けし、そのパーサーが提供するプロパティを読み取ってください。
