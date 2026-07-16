# Декораторы загрузки файлов

Express-Cargo привязывает файлы из запроса `multipart/form-data` прямо в ваш DTO вместе с обычными полями. Две формы, которые может принимать загрузка, покрываются двумя декораторами:

- **`@UploadedFile()`** — один файл для поля.
- **`@UploadedFiles()`** — все файлы, разделяющие имя поля, в виде массива.

Express-Cargo не разбирает тело multipart самостоятельно. Промежуточное ПО-парсер (например, [multer](https://github.com/expressjs/multer)) должно выполняться **до** `bindingCargo` и прикреплять разобранные файлы к запросу. Затем Express-Cargo находит эти файлы и привязывает их **как есть** — объекты файлов никогда не изменяются.

## `@UploadedFile(key?: string)`

Привязывает один загруженный файл. Если несколько файлов разделяют имя поля, привязывается первый.

- **`key`**: Имя поля формы. По умолчанию — имя свойства.

```typescript
class UploadAvatarRequest {
    @UploadedFile()
    avatar!: Express.Multer.File
}
```

## `@UploadedFiles(key?: string)`

Привязывает все загруженные файлы, разделяющие имя поля, в виде массива.

- **`key`**: Имя поля формы. По умолчанию — имя свойства.

```typescript
class UploadGalleryRequest {
    @UploadedFiles('photos')
    photos!: Express.Multer.File[]
}
```

## Пример использования

Настройте парсер multipart, запустите его как промежуточное ПО маршрута перед `bindingCargo`, затем прочитайте привязанные файлы из DTO. Обычные поля, такие как `@Body`, привязываются из того же запроса обычным образом.

```typescript
import express, { Request, Response } from 'express'
import multer from 'multer'
import { bindingCargo, getCargo, Body, UploadedFile, UploadedFiles } from 'express-cargo'

const upload = multer({ storage: multer.memoryStorage() })

// Текстовое поле и один файл в одном запросе
class UploadProfileRequest {
    @Body('bio')
    bio!: string

    @UploadedFile('avatar')
    avatar!: Express.Multer.File

    @UploadedFiles('gallery')
    gallery!: Express.Multer.File[]
}

const app = express()

// Промежуточное ПО-парсер выполняется первым и объявляет ожидаемые поля,
// затем bindingCargo сопоставляет разобранные файлы с DTO.
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

Промежуточное ПО-парсер определяет, какие поля принимаются:

| Вызов multer                                | Соответствующий декоратор             |
|---------------------------------------------|---------------------------------------|
| `upload.single('avatar')`                   | `@UploadedFile('avatar')`             |
| `upload.array('photos')`                    | `@UploadedFiles('photos')`            |
| `upload.fields([{ name: 'avatar' }, ... ])` | по одному декоратору на именованное поле |
| `upload.any()`                              | любой из вышеперечисленных, по полю   |

## Отсутствующие файлы

Поле загрузки следует тем же правилам отсутствующих значений, что и любой другой источник. Когда для поля не приходит файл:

- Без обоих декораторов привязка завершается ошибкой `<field> is required`.
- С [`@Optional()`](./missing-fields.md) поле привязывается к `null`, а его валидаторы пропускаются.
- С [`@Default(value)`](./missing-fields.md) используется запасное значение.

```typescript
class UploadRequest {
    @UploadedFile()
    @Optional()
    avatar?: Express.Multer.File
}
```

## `@Transform` не допускается

Файлы привязываются точно так, как их создал парсер, поэтому пользовательскому `@Transform` на поле загрузки нечего преобразовывать. Их сочетание вызывает ошибку схемы при запуске:

```typescript
class UploadRequest {
    // ❌ Недопустимо: файлы привязываются как есть и не могут быть преобразованы
    @UploadedFile()
    @Transform((file: Express.Multer.File) => file)
    avatar!: Express.Multer.File
}
```

## Использование другого парсера

По умолчанию Express-Cargo читает файлы из `req.file` и `req.files` multer. Чтобы интегрировать парсер с другой структурой запроса — например, [formidable](https://github.com/node-formidable/formidable), другой широко используемый парсер multipart — зарегистрируйте один раз при запуске приложения пользовательский **локатор файлов** через `setCargoFileLocator`. Он применяется к каждому маршруту, поэтому локатор адаптирует парсер в целом, а не знает о каком-либо конкретном поле.

Локатор принимает Express `Request` и возвращает загруженные файлы, сгруппированные по имени поля формы — `Record<string, File[]>`, индексированный по имени поля. Поскольку formidable не является промежуточным ПО, разберите запрос самостоятельно и прикрепите результат; затем локатор передаёт его в Express-Cargo:

```typescript
import express, { Request, Response, NextFunction } from 'express'
import formidable, { File } from 'formidable'
import { setCargoFileLocator } from 'express-cargo'

// 1. formidable не является промежуточным ПО — разберите запрос самостоятельно и прикрепите результат.
//    В v3 `files` уже индексирован по имени поля с массивом на каждое поле.
async function parseMultipart(req: Request, _res: Response, next: NextFunction) {
    const [, files] = await formidable().parse(req)
    ;(req as any).files = files // Record<string, File[]>
    next()
}

// 2. Зарегистрируйте локатор один раз при запуске, чтобы Express-Cargo читал эти файлы.
setCargoFileLocator((req: Request): Record<string, File[]> => (req as any).files ?? {})
```

Каждое поле сопоставляется с **массивом**, даже то, что несёт один файл: `@UploadedFile()` берёт первый элемент массива своего поля, а `@UploadedFiles()` берёт весь массив. Только логика поиска специфична для парсера; сами объекты файлов по-прежнему привязываются как есть.

Поскольку файлы привязываются как есть, их тип и имена свойств происходят от парсера: multer предоставляет `originalname` и `buffer`, а formidable предоставляет `originalFilename` и `filepath`. Типизируйте каждое поле DTO типом файла используемого вами парсера и читайте свойства, которые предоставляет этот парсер.
