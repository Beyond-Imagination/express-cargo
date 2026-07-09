# 파일 업로드 데코레이터

Express-Cargo는 `multipart/form-data` 요청의 파일을 일반 필드와 함께 DTO에 곧바로 바인딩합니다. 업로드가 가질 수 있는 두 가지 형태를 두 데코레이터가 담당합니다.

- **`@UploadedFile()`** — 한 필드의 단일 파일.
- **`@UploadedFiles()`** — 같은 필드 이름을 공유하는 모든 파일을 배열로.

Express-Cargo는 multipart 본문을 직접 파싱하지 않습니다. 파서 미들웨어(예: [multer](https://github.com/expressjs/multer))가 `bindingCargo` **앞에서** 실행되어 파싱된 파일을 요청에 붙여야 합니다. 그러면 Express-Cargo가 그 파일들을 찾아 **있는 그대로** 바인딩합니다 — 파일 객체는 변형되지 않습니다.

## `@UploadedFile(key?: string)`

단일 업로드 파일을 바인딩합니다. 같은 필드 이름을 여러 파일이 공유하면 첫 번째 파일이 바인딩됩니다.

- **`key`**: 폼 필드 이름. 기본값은 프로퍼티 이름입니다.

```typescript
class UploadAvatarRequest {
    @UploadedFile()
    avatar!: Express.Multer.File
}
```

## `@UploadedFiles(key?: string)`

같은 필드 이름을 공유하는 모든 업로드 파일을 배열로 바인딩합니다.

- **`key`**: 폼 필드 이름. 기본값은 프로퍼티 이름입니다.

```typescript
class UploadGalleryRequest {
    @UploadedFiles('photos')
    photos!: Express.Multer.File[]
}
```

## 사용 예시

multipart 파서를 설정하고 `bindingCargo`보다 앞선 라우트 미들웨어로 실행한 뒤, DTO에서 바인딩된 파일을 읽습니다. `@Body` 같은 일반 필드도 같은 요청에서 평소처럼 바인딩됩니다.

```typescript
import express, { Request, Response } from 'express'
import multer from 'multer'
import { bindingCargo, getCargo, Body, UploadedFile, UploadedFiles } from 'express-cargo'

const upload = multer({ storage: multer.memoryStorage() })

// 하나의 요청에 텍스트 필드와 단일 파일
class UploadProfileRequest {
    @Body('bio')
    bio!: string

    @UploadedFile('avatar')
    avatar!: Express.Multer.File

    @UploadedFiles('gallery')
    gallery!: Express.Multer.File[]
}

const app = express()

// 파서 미들웨어가 먼저 실행되어 기대하는 필드를 선언하고,
// 그다음 bindingCargo가 파싱된 파일을 DTO에 매핑합니다.
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

파서 미들웨어가 어떤 필드를 받을지 결정합니다.

| Multer 호출                                 | 대응 데코레이터                    |
|---------------------------------------------|-----------------------------------|
| `upload.single('avatar')`                   | `@UploadedFile('avatar')`         |
| `upload.array('photos')`                    | `@UploadedFiles('photos')`        |
| `upload.fields([{ name: 'avatar' }, ... ])` | 이름이 지정된 필드마다 하나씩      |
| `upload.any()`                              | 위 어느 것이든, 필드 이름으로 매칭 |

## 파일 누락

업로드 필드는 다른 소스와 동일한 누락 값 규칙을 따릅니다. 해당 필드에 파일이 오지 않으면:

- 두 데코레이터 중 아무것도 없으면, `<field> is required` 오류로 바인딩이 실패합니다.
- [`@Optional()`](./missing-fields.md)이 있으면, 필드는 `null`로 바인딩되고 검증 규칙은 건너뜁니다.
- [`@Default(value)`](./missing-fields.md)가 있으면, 기본값이 사용됩니다.

```typescript
class UploadRequest {
    @UploadedFile()
    @Optional()
    avatar?: Express.Multer.File
}
```

## `@Transform`은 허용되지 않음

파일은 파서가 만든 그대로 바인딩되므로, 업로드 필드에 사용자 `@Transform`을 붙여도 변환할 대상이 없습니다. 둘을 함께 쓰면 시작 시 스키마 오류가 발생합니다.

```typescript
class UploadRequest {
    // ❌ 잘못됨: 파일은 있는 그대로 바인딩되며 변환할 수 없습니다
    @UploadedFile()
    @Transform((file: Express.Multer.File) => file)
    avatar!: Express.Multer.File
}
```

## 다른 파서 사용하기

기본적으로 Express-Cargo는 multer의 `req.file`과 `req.files`에서 파일을 읽습니다. 요청 구조가 다른 파서 — 예를 들어 널리 쓰이는 또 다른 multipart 파서인 [formidable](https://github.com/node-formidable/formidable) — 를 통합하려면, 애플리케이션 시작 시 `setCargoFileLocator`로 커스텀 **파일 로케이터**를 한 번 등록합니다. 이는 모든 라우트에 적용되므로, 로케이터는 특정 필드를 알아야 하는 게 아니라 파서를 일반적으로 적응시킵니다.

로케이터는 Express `Request`를 받아 업로드된 파일을 폼 필드 이름별로 묶어 반환합니다 — 필드 이름을 키로 하는 `Record<string, File[]>`입니다. formidable은 미들웨어가 아니므로, 요청을 직접 파싱해 결과를 붙이면 로케이터가 그것을 Express-Cargo에 전달합니다.

```typescript
import express, { Request, Response, NextFunction } from 'express'
import formidable, { File } from 'formidable'
import { setCargoFileLocator } from 'express-cargo'

// 1. formidable은 미들웨어가 아닙니다 — 요청을 직접 파싱해 결과를 붙입니다.
//    v3에서 `files`는 이미 필드 이름별로 배열이 키잉되어 있습니다.
async function parseMultipart(req: Request, _res: Response, next: NextFunction) {
    const [, files] = await formidable().parse(req)
    ;(req as any).files = files // Record<string, File[]>
    next()
}

// 2. 시작 시 로케이터를 한 번 등록하여 Express-Cargo가 그 파일을 읽도록 합니다.
setCargoFileLocator((req: Request): Record<string, File[]> => (req as any).files ?? {})
```

모든 필드는 단일 파일을 담더라도 **배열**로 매핑됩니다. `@UploadedFile()`은 해당 필드 배열의 첫 항목을, `@UploadedFiles()`는 배열 전체를 취합니다. 파서에 종속되는 것은 위치 탐색 로직뿐이며, 파일 객체 자체는 여전히 있는 그대로 바인딩됩니다.

파일이 있는 그대로 바인딩되므로, 그 타입과 프로퍼티 이름은 파서에서 옵니다. multer는 `originalname`과 `buffer`를, formidable은 `originalFilename`과 `filepath`를 노출합니다. 사용하는 파서의 파일 타입으로 각 DTO 필드를 타이핑하고, 그 파서가 제공하는 프로퍼티를 읽으세요.
