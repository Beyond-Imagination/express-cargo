# 文件上传装饰器

Express-Cargo 会把 `multipart/form-data` 请求中的文件与普通字段一起直接绑定到你的 DTO。上传可能呈现的两种形态由两个装饰器覆盖：

- **`@UploadedFile()`** —— 一个字段的单个文件。
- **`@UploadedFiles()`** —— 共享同一字段名的所有文件，作为数组。

Express-Cargo 本身不解析 multipart 请求体。解析中间件（例如 [multer](https://github.com/expressjs/multer)）必须在 `bindingCargo` **之前** 运行，并把解析后的文件附加到请求上。随后 Express-Cargo 定位这些文件并**原样**绑定 —— 文件对象绝不会被修改。

## `@UploadedFile(key?: string)`

绑定单个上传文件。如果多个文件共享同一字段名，则绑定第一个。

- **`key`**：表单字段名。默认为属性名。

```typescript
class UploadAvatarRequest {
    @UploadedFile()
    avatar!: Express.Multer.File
}
```

## `@UploadedFiles(key?: string)`

将共享同一字段名的所有上传文件绑定为数组。

- **`key`**：表单字段名。默认为属性名。

```typescript
class UploadGalleryRequest {
    @UploadedFiles('photos')
    photos!: Express.Multer.File[]
}
```

## 使用示例

配置一个 multipart 解析器，将其作为路由中间件在 `bindingCargo` 之前运行，然后从 DTO 中读取已绑定的文件。像 `@Body` 这样的普通字段也会以通常的方式从同一请求中绑定。

```typescript
import express, { Request, Response } from 'express'
import multer from 'multer'
import { bindingCargo, getCargo, Body, UploadedFile, UploadedFiles } from 'express-cargo'

const upload = multer({ storage: multer.memoryStorage() })

// 一个请求中包含一个文本字段和一个单文件
class UploadProfileRequest {
    @Body('bio')
    bio!: string

    @UploadedFile('avatar')
    avatar!: Express.Multer.File

    @UploadedFiles('gallery')
    gallery!: Express.Multer.File[]
}

const app = express()

// 解析中间件先运行并声明期望的字段，
// 然后 bindingCargo 把解析后的文件映射到 DTO。
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

解析中间件决定接受哪些字段：

| Multer 调用                                 | 对应装饰器                  |
|---------------------------------------------|----------------------------|
| `upload.single('avatar')`                   | `@UploadedFile('avatar')`  |
| `upload.array('photos')`                    | `@UploadedFiles('photos')` |
| `upload.fields([{ name: 'avatar' }, ... ])` | 每个具名字段一个           |
| `upload.any()`                              | 上述任意一种，按字段匹配   |

## 缺失文件

上传字段遵循与其他来源相同的缺失值规则。当该字段没有文件到达时：

- 若两个装饰器都没有，绑定会以 `<field> is required` 错误失败。
- 使用 [`@Optional()`](./missing-fields.md) 时，字段绑定为 `null`，其校验器被跳过。
- 使用 [`@Default(value)`](./missing-fields.md) 时，使用回退值。

```typescript
class UploadRequest {
    @UploadedFile()
    @Optional()
    avatar?: Express.Multer.File
}
```

## 不允许使用 `@Transform`

文件会完全按照解析器产生的样子绑定，因此在上传字段上使用用户的 `@Transform` 没有可转换的对象。将两者组合会在启动时抛出 schema 错误：

```typescript
class UploadRequest {
    // ❌ 无效：文件按原样绑定，无法转换
    @UploadedFile()
    @Transform((file: Express.Multer.File) => file)
    avatar!: Express.Multer.File
}
```

## 使用其他解析器

默认情况下，Express-Cargo 从 multer 的 `req.file` 和 `req.files` 读取文件。若要集成请求结构不同的解析器 —— 例如另一个广泛使用的 multipart 解析器 [formidable](https://github.com/node-formidable/formidable) —— 请在应用启动时用 `setCargoFileLocator` 注册一次自定义 **文件定位器**。它适用于每个路由，因此定位器是对解析器进行通用适配，而不是了解某个特定字段。

定位器接收 Express `Request`，并返回按表单字段名分组的上传文件 —— 一个以字段名为键的 `Record<string, File[]>`。由于 formidable 不是中间件，你需要自行解析请求并附加结果；定位器随后把它交给 Express-Cargo：

```typescript
import express, { Request, Response, NextFunction } from 'express'
import formidable, { File } from 'formidable'
import { setCargoFileLocator } from 'express-cargo'

// 1. formidable 不是中间件 —— 自行解析请求并附加结果。
//    在 v3 中，`files` 已经按字段名分组，每个字段对应一个数组。
async function parseMultipart(req: Request, _res: Response, next: NextFunction) {
    const [, files] = await formidable().parse(req)
    ;(req as any).files = files // Record<string, File[]>
    next()
}

// 2. 在启动时注册一次定位器，让 Express-Cargo 读取这些文件。
setCargoFileLocator((req: Request): Record<string, File[]> => (req as any).files ?? {})
```

每个字段都映射为一个**数组**，即便它只承载单个文件：`@UploadedFile()` 取其字段数组的第一项，而 `@UploadedFiles()` 取整个数组。只有定位逻辑与解析器相关；文件对象本身仍然按原样绑定。

由于文件按原样绑定，其类型和属性名来自解析器：multer 暴露 `originalname` 和 `buffer`，而 formidable 暴露 `originalFilename` 和 `filepath`。请用你所使用解析器的文件类型来标注每个 DTO 字段，并读取该解析器提供的属性。
