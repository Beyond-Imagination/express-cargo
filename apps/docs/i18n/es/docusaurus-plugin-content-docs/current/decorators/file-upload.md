# Decoradores de subida de archivos

Express-Cargo enlaza los archivos de una solicitud `multipart/form-data` directamente en tu DTO, junto con los campos habituales. Dos decoradores cubren las dos formas que puede tomar una subida:

- **`@UploadedFile()`** — un único archivo para un campo.
- **`@UploadedFiles()`** — todos los archivos que comparten un nombre de campo, como un array.

Express-Cargo no analiza el cuerpo multipart por sí mismo. Un middleware analizador (como [multer](https://github.com/expressjs/multer)) debe ejecutarse **antes** de `bindingCargo` y adjuntar los archivos analizados a la solicitud. Luego Express-Cargo localiza esos archivos y los enlaza **tal cual** — los objetos de archivo nunca se modifican.

## `@UploadedFile(key?: string)`

Enlaza un único archivo subido. Si varios archivos comparten el nombre de campo, se enlaza el primero.

- **`key`**: El nombre del campo del formulario. Por defecto, el nombre de la propiedad.

```typescript
class UploadAvatarRequest {
    @UploadedFile()
    avatar!: Express.Multer.File
}
```

## `@UploadedFiles(key?: string)`

Enlaza todos los archivos subidos que comparten el nombre de campo como un array.

- **`key`**: El nombre del campo del formulario. Por defecto, el nombre de la propiedad.

```typescript
class UploadGalleryRequest {
    @UploadedFiles('photos')
    photos!: Express.Multer.File[]
}
```

## Ejemplo de uso

Configura un analizador multipart, ejecútalo como middleware de ruta antes de `bindingCargo` y luego lee los archivos enlazados desde el DTO. Los campos habituales como `@Body` se enlazan desde la misma solicitud de la manera habitual.

```typescript
import express, { Request, Response } from 'express'
import multer from 'multer'
import { bindingCargo, getCargo, Body, UploadedFile, UploadedFiles } from 'express-cargo'

const upload = multer({ storage: multer.memoryStorage() })

// Un campo de texto y un único archivo en una solicitud
class UploadProfileRequest {
    @Body('bio')
    bio!: string

    @UploadedFile('avatar')
    avatar!: Express.Multer.File

    @UploadedFiles('gallery')
    gallery!: Express.Multer.File[]
}

const app = express()

// El middleware analizador se ejecuta primero y declara los campos esperados,
// luego bindingCargo asigna los archivos analizados al DTO.
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

El middleware analizador determina qué campos se aceptan:

| Llamada de multer                           | Decorador correspondiente             |
|---------------------------------------------|---------------------------------------|
| `upload.single('avatar')`                   | `@UploadedFile('avatar')`             |
| `upload.array('photos')`                    | `@UploadedFiles('photos')`            |
| `upload.fields([{ name: 'avatar' }, ... ])` | un decorador por campo nombrado       |
| `upload.any()`                              | cualquiera de los anteriores, por campo |

## Archivos ausentes

Un campo de subida sigue las mismas reglas de valor ausente que cualquier otra fuente. Cuando no llega ningún archivo para el campo:

- Sin ninguno de los dos decoradores, el enlace falla con un error `<field> is required`.
- Con [`@Optional()`](./missing-fields.md), el campo se enlaza a `null` y sus validadores se omiten.
- Con [`@Default(value)`](./missing-fields.md), se usa el valor de reserva.

```typescript
class UploadRequest {
    @UploadedFile()
    @Optional()
    avatar?: Express.Multer.File
}
```

## `@Transform` no está permitido

Los archivos se enlazan exactamente como los produjo el analizador, así que un `@Transform` de usuario en un campo de subida no tiene nada que transformar. Combinarlos lanza un error de esquema al inicio:

```typescript
class UploadRequest {
    // ❌ Inválido: los archivos se enlazan tal cual y no pueden transformarse
    @UploadedFile()
    @Transform((file: Express.Multer.File) => file)
    avatar!: Express.Multer.File
}
```

## Usar un analizador diferente

De forma predeterminada, Express-Cargo lee los archivos de `req.file` y `req.files` de multer. Para integrar un analizador con una estructura de solicitud diferente — como [formidable](https://github.com/node-formidable/formidable), el otro analizador multipart ampliamente usado — registra una vez un **localizador de archivos** personalizado al iniciar la aplicación con `setCargoFileLocator`. Se aplica a todas las rutas, de modo que el localizador adapta el analizador en general en lugar de conocer un campo específico.

Un localizador toma el `Request` de Express y devuelve los archivos subidos agrupados por nombre de campo del formulario — un `Record<string, File[]>` indexado por nombre de campo. Como formidable no es middleware, analiza la solicitud tú mismo y adjunta el resultado; el localizador luego lo entrega a Express-Cargo:

```typescript
import express, { Request, Response, NextFunction } from 'express'
import formidable, { File } from 'formidable'
import { setCargoFileLocator } from 'express-cargo'

// 1. formidable no es middleware — analiza la solicitud tú mismo y adjunta el resultado.
//    En v3, `files` ya está indexado por nombre de campo con un array por campo.
async function parseMultipart(req: Request, _res: Response, next: NextFunction) {
    const [, files] = await formidable().parse(req)
    ;(req as any).files = files // Record<string, File[]>
    next()
}

// 2. Registra el localizador una vez al inicio para que Express-Cargo lea esos archivos.
setCargoFileLocator((req: Request): Record<string, File[]> => (req as any).files ?? {})
```

Cada campo se asigna a un **array**, incluso uno que lleva un único archivo: `@UploadedFile()` toma la primera entrada del array de su campo, mientras que `@UploadedFiles()` toma todo el array. Solo la lógica de localización es específica del analizador; los objetos de archivo en sí se siguen enlazando tal cual.

Como los archivos se enlazan tal cual, su tipo y nombres de propiedad provienen del analizador: multer expone `originalname` y `buffer`, mientras que formidable expone `originalFilename` y `filepath`. Tipa cada campo del DTO con el tipo de archivo del analizador que uses, y lee las propiedades que ese analizador proporciona.
