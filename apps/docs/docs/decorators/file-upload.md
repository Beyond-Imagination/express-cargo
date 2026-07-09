# File Upload Decorators

Express-Cargo binds files from a `multipart/form-data` request straight into your DTO alongside regular fields. Two decorators cover the two shapes an upload can take:

- **`@UploadedFile()`** — a single file for a field.
- **`@UploadedFiles()`** — every file that shares a field name, as an array.

Express-Cargo does not parse the multipart body itself. A parser middleware (such as [multer](https://github.com/expressjs/multer)) must run **before** `bindingCargo` and attach the parsed files to the request. Express-Cargo then locates those files and binds them **as-is** — the file objects are never modified.

## `@UploadedFile(key?: string)`

Binds a single uploaded file. If several files share the field name, the first one is bound.

- **`key`**: The form field name. Defaults to the property name.

```typescript
class UploadAvatarRequest {
    @UploadedFile()
    avatar!: Express.Multer.File
}
```

## `@UploadedFiles(key?: string)`

Binds every uploaded file that shares the field name as an array.

- **`key`**: The form field name. Defaults to the property name.

```typescript
class UploadGalleryRequest {
    @UploadedFiles('photos')
    photos!: Express.Multer.File[]
}
```

## Usage Example

Configure a multipart parser, run it as route middleware ahead of `bindingCargo`, then read the bound files from the DTO. Regular fields such as `@Body` bind from the same request in the usual way.

```typescript
import express, { Request, Response } from 'express'
import multer from 'multer'
import { bindingCargo, getCargo, Body, UploadedFile, UploadedFiles } from 'express-cargo'

const upload = multer({ storage: multer.memoryStorage() })

// A text field and a single file in one request
class UploadProfileRequest {
    @Body('bio')
    bio!: string

    @UploadedFile('avatar')
    avatar!: Express.Multer.File

    @UploadedFiles('gallery')
    gallery!: Express.Multer.File[]
}

const app = express()

// The parser middleware runs first and declares the expected fields,
// then bindingCargo maps the parsed files onto the DTO.
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

The parser middleware determines which fields are accepted:

| Multer call                                 | Matching decorator                    |
|---------------------------------------------|---------------------------------------|
| `upload.single('avatar')`                   | `@UploadedFile('avatar')`             |
| `upload.array('photos')`                    | `@UploadedFiles('photos')`            |
| `upload.fields([{ name: 'avatar' }, ... ])` | one decorator per named field         |
| `upload.any()`                              | any of the above, matched by field    |

## Missing Files

An upload field follows the same missing-value rules as any other source. When no file arrives for the field:

- With neither decorator, binding fails with a `<field> is required` error.
- With [`@Optional()`](./missing-fields.md), the field binds to `null` and its validators are skipped.
- With [`@Default(value)`](./missing-fields.md), the fallback value is used.

```typescript
class UploadRequest {
    @UploadedFile()
    @Optional()
    avatar?: Express.Multer.File
}
```

## `@Transform` Is Not Allowed

Files are bound exactly as the parser produced them, so a user `@Transform` on an upload field has nothing to transform. Combining them throws a schema error at startup:

```typescript
class UploadRequest {
    // ❌ Invalid: files are bound as-is and cannot be transformed
    @UploadedFile()
    @Transform((file: Express.Multer.File) => file)
    avatar!: Express.Multer.File
}
```

## Using a Different Parser

By default, Express-Cargo reads files from multer's `req.file` and `req.files`. To integrate a parser with a different request shape — such as [formidable](https://github.com/node-formidable/formidable), the other widely used multipart parser — register a custom **file locator** once at application startup with `setCargoFileLocator`. It applies to every route, so the locator adapts the parser in general rather than knowing about any specific field.

A locator takes the Express `Request` and returns the uploaded files grouped by form field name — a `Record<string, File[]>` keyed by field name. Since formidable is not middleware, parse the request yourself and attach the result; the locator then hands it to Express-Cargo:

```typescript
import express, { Request, Response, NextFunction } from 'express'
import formidable, { File } from 'formidable'
import { setCargoFileLocator } from 'express-cargo'

// 1. formidable is not middleware — parse the request and attach the result yourself.
//    In v3, `files` is already keyed by field name with an array per field.
async function parseMultipart(req: Request, _res: Response, next: NextFunction) {
    const [, files] = await formidable().parse(req)
    ;(req as any).files = files // Record<string, File[]>
    next()
}

// 2. Register the locator once at startup so Express-Cargo reads those files.
setCargoFileLocator((req: Request): Record<string, File[]> => (req as any).files ?? {})
```

Every field maps to an **array**, even one that carries a single file: `@UploadedFile()` takes the first entry of its field's array, while `@UploadedFiles()` takes the whole array. Only the location logic is parser-specific; the file objects themselves are still bound untouched.

Because files are bound untouched, their type and property names come from the parser: multer exposes `originalname` and `buffer`, while formidable exposes `originalFilename` and `filepath`. Type each DTO field with the file type of the parser you use, and read the properties that parser provides.
