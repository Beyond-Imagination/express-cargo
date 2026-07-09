# Datei-Upload-Decorators

Express-Cargo bindet Dateien aus einer `multipart/form-data`-Anfrage direkt zusammen mit regulären Feldern in Ihr DTO. Zwei Decorators decken die zwei Formen ab, die ein Upload annehmen kann:

- **`@UploadedFile()`** — eine einzelne Datei für ein Feld.
- **`@UploadedFiles()`** — alle Dateien, die sich einen Feldnamen teilen, als Array.

Express-Cargo parst den Multipart-Body nicht selbst. Eine Parser-Middleware (wie [multer](https://github.com/expressjs/multer)) muss **vor** `bindingCargo` laufen und die geparsten Dateien an die Anfrage anhängen. Express-Cargo findet diese Dateien dann und bindet sie **unverändert** — die Dateiobjekte werden nie verändert.

## `@UploadedFile(key?: string)`

Bindet eine einzelne hochgeladene Datei. Wenn sich mehrere Dateien den Feldnamen teilen, wird die erste gebunden.

- **`key`**: Der Formularfeldname. Standardmäßig der Eigenschaftsname.

```typescript
class UploadAvatarRequest {
    @UploadedFile()
    avatar!: Express.Multer.File
}
```

## `@UploadedFiles(key?: string)`

Bindet alle hochgeladenen Dateien, die sich den Feldnamen teilen, als Array.

- **`key`**: Der Formularfeldname. Standardmäßig der Eigenschaftsname.

```typescript
class UploadGalleryRequest {
    @UploadedFiles('photos')
    photos!: Express.Multer.File[]
}
```

## Anwendungsbeispiel

Konfigurieren Sie einen Multipart-Parser, führen Sie ihn als Route-Middleware vor `bindingCargo` aus und lesen Sie dann die gebundenen Dateien aus dem DTO. Reguläre Felder wie `@Body` werden aus derselben Anfrage wie gewohnt gebunden.

```typescript
import express, { Request, Response } from 'express'
import multer from 'multer'
import { bindingCargo, getCargo, Body, UploadedFile, UploadedFiles } from 'express-cargo'

const upload = multer({ storage: multer.memoryStorage() })

// Ein Textfeld und eine einzelne Datei in einer Anfrage
class UploadProfileRequest {
    @Body('bio')
    bio!: string

    @UploadedFile('avatar')
    avatar!: Express.Multer.File

    @UploadedFiles('gallery')
    gallery!: Express.Multer.File[]
}

const app = express()

// Die Parser-Middleware läuft zuerst und deklariert die erwarteten Felder,
// dann ordnet bindingCargo die geparsten Dateien dem DTO zu.
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

Die Parser-Middleware bestimmt, welche Felder akzeptiert werden:

| Multer-Aufruf                               | Passender Decorator                   |
|---------------------------------------------|---------------------------------------|
| `upload.single('avatar')`                   | `@UploadedFile('avatar')`             |
| `upload.array('photos')`                    | `@UploadedFiles('photos')`            |
| `upload.fields([{ name: 'avatar' }, ... ])` | ein Decorator pro benanntem Feld      |
| `upload.any()`                              | beliebiger der obigen, nach Feld      |

## Fehlende Dateien

Ein Upload-Feld folgt denselben Regeln für fehlende Werte wie jede andere Quelle. Wenn keine Datei für das Feld ankommt:

- Ohne einen der Decorators schlägt das Binden mit einem `<field> is required`-Fehler fehl.
- Mit [`@Optional()`](./missing-fields.md) wird das Feld an `null` gebunden und seine Validatoren werden übersprungen.
- Mit [`@Default(value)`](./missing-fields.md) wird der Ersatzwert verwendet.

```typescript
class UploadRequest {
    @UploadedFile()
    @Optional()
    avatar?: Express.Multer.File
}
```

## `@Transform` ist nicht erlaubt

Dateien werden genau so gebunden, wie der Parser sie erzeugt hat, daher hat ein benutzerdefiniertes `@Transform` auf einem Upload-Feld nichts zu transformieren. Ihre Kombination wirft beim Start einen Schema-Fehler:

```typescript
class UploadRequest {
    // ❌ Ungültig: Dateien werden unverändert gebunden und können nicht transformiert werden
    @UploadedFile()
    @Transform((file: Express.Multer.File) => file)
    avatar!: Express.Multer.File
}
```

## Einen anderen Parser verwenden

Standardmäßig liest Express-Cargo Dateien aus multers `req.file` und `req.files`. Um einen Parser mit einer anderen Anfragestruktur zu integrieren — wie [formidable](https://github.com/node-formidable/formidable), den anderen weit verbreiteten Multipart-Parser — registrieren Sie beim Anwendungsstart einmal einen benutzerdefinierten **File-Locator** mit `setCargoFileLocator`. Er gilt für jede Route, sodass der Locator den Parser allgemein anpasst, anstatt ein bestimmtes Feld zu kennen.

Ein Locator nimmt das Express-`Request` und gibt die hochgeladenen Dateien nach Formularfeldname gruppiert zurück — ein `Record<string, File[]>`, das nach Feldname indiziert ist. Da formidable keine Middleware ist, parsen Sie die Anfrage selbst und hängen das Ergebnis an; der Locator reicht es dann an Express-Cargo weiter:

```typescript
import express, { Request, Response, NextFunction } from 'express'
import formidable, { File } from 'formidable'
import { setCargoFileLocator } from 'express-cargo'

// 1. formidable ist keine Middleware — parsen Sie die Anfrage selbst und hängen Sie das Ergebnis an.
//    In v3 ist `files` bereits nach Feldname mit einem Array pro Feld indiziert.
async function parseMultipart(req: Request, _res: Response, next: NextFunction) {
    const [, files] = await formidable().parse(req)
    ;(req as any).files = files // Record<string, File[]>
    next()
}

// 2. Registrieren Sie den Locator einmal beim Start, damit Express-Cargo diese Dateien liest.
setCargoFileLocator((req: Request): Record<string, File[]> => (req as any).files ?? {})
```

Jedes Feld wird auf ein **Array** abgebildet, selbst eines, das eine einzelne Datei trägt: `@UploadedFile()` nimmt den ersten Eintrag des Arrays seines Feldes, während `@UploadedFiles()` das gesamte Array nimmt. Nur die Lokalisierungslogik ist parserspezifisch; die Dateiobjekte selbst werden weiterhin unverändert gebunden.

Da Dateien unverändert gebunden werden, stammen ihr Typ und ihre Eigenschaftsnamen vom Parser: multer stellt `originalname` und `buffer` bereit, während formidable `originalFilename` und `filepath` bereitstellt. Typisieren Sie jedes DTO-Feld mit dem Dateityp des von Ihnen verwendeten Parsers und lesen Sie die Eigenschaften, die dieser Parser bereitstellt.
