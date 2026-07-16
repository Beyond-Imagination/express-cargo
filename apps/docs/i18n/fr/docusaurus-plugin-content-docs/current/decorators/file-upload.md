# Décorateurs de téléversement de fichiers

Express-Cargo lie les fichiers d'une requête `multipart/form-data` directement dans votre DTO, aux côtés des champs habituels. Deux décorateurs couvrent les deux formes que peut prendre un téléversement :

- **`@UploadedFile()`** — un seul fichier pour un champ.
- **`@UploadedFiles()`** — tous les fichiers partageant un nom de champ, sous forme de tableau.

Express-Cargo n'analyse pas lui-même le corps multipart. Une middleware d'analyse (comme [multer](https://github.com/expressjs/multer)) doit s'exécuter **avant** `bindingCargo` et attacher les fichiers analysés à la requête. Express-Cargo localise ensuite ces fichiers et les lie **tels quels** — les objets fichier ne sont jamais modifiés.

## `@UploadedFile(key?: string)`

Lie un seul fichier téléversé. Si plusieurs fichiers partagent le nom de champ, le premier est lié.

- **`key`** : Le nom du champ de formulaire. Par défaut, le nom de la propriété.

```typescript
class UploadAvatarRequest {
    @UploadedFile()
    avatar!: Express.Multer.File
}
```

## `@UploadedFiles(key?: string)`

Lie tous les fichiers téléversés partageant le nom de champ sous forme de tableau.

- **`key`** : Le nom du champ de formulaire. Par défaut, le nom de la propriété.

```typescript
class UploadGalleryRequest {
    @UploadedFiles('photos')
    photos!: Express.Multer.File[]
}
```

## Exemple d'utilisation

Configurez un analyseur multipart, exécutez-le comme middleware de route avant `bindingCargo`, puis lisez les fichiers liés depuis le DTO. Les champs habituels comme `@Body` sont liés depuis la même requête de la manière habituelle.

```typescript
import express, { Request, Response } from 'express'
import multer from 'multer'
import { bindingCargo, getCargo, Body, UploadedFile, UploadedFiles } from 'express-cargo'

const upload = multer({ storage: multer.memoryStorage() })

// Un champ texte et un seul fichier dans une même requête
class UploadProfileRequest {
    @Body('bio')
    bio!: string

    @UploadedFile('avatar')
    avatar!: Express.Multer.File

    @UploadedFiles('gallery')
    gallery!: Express.Multer.File[]
}

const app = express()

// La middleware d'analyse s'exécute d'abord et déclare les champs attendus,
// puis bindingCargo associe les fichiers analysés au DTO.
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

La middleware d'analyse détermine quels champs sont acceptés :

| Appel multer                                | Décorateur correspondant              |
|---------------------------------------------|---------------------------------------|
| `upload.single('avatar')`                   | `@UploadedFile('avatar')`             |
| `upload.array('photos')`                    | `@UploadedFiles('photos')`            |
| `upload.fields([{ name: 'avatar' }, ... ])` | un décorateur par champ nommé         |
| `upload.any()`                              | l'un des précédents, associé par champ |

## Fichiers manquants

Un champ de téléversement suit les mêmes règles de valeur manquante que toute autre source. Quand aucun fichier n'arrive pour le champ :

- Sans aucun des deux décorateurs, la liaison échoue avec une erreur `<field> is required`.
- Avec [`@Optional()`](./missing-fields.md), le champ est lié à `null` et ses validateurs sont ignorés.
- Avec [`@Default(value)`](./missing-fields.md), la valeur de repli est utilisée.

```typescript
class UploadRequest {
    @UploadedFile()
    @Optional()
    avatar?: Express.Multer.File
}
```

## `@Transform` n'est pas autorisé

Les fichiers sont liés exactement tels que l'analyseur les a produits, donc un `@Transform` utilisateur sur un champ de téléversement n'a rien à transformer. Les combiner lève une erreur de schéma au démarrage :

```typescript
class UploadRequest {
    // ❌ Invalide : les fichiers sont liés tels quels et ne peuvent pas être transformés
    @UploadedFile()
    @Transform((file: Express.Multer.File) => file)
    avatar!: Express.Multer.File
}
```

## Utiliser un autre analyseur

Par défaut, Express-Cargo lit les fichiers depuis `req.file` et `req.files` de multer. Pour intégrer un analyseur avec une structure de requête différente — comme [formidable](https://github.com/node-formidable/formidable), l'autre analyseur multipart largement utilisé — enregistrez une fois un **localisateur de fichiers** personnalisé au démarrage de l'application avec `setCargoFileLocator`. Il s'applique à chaque route, de sorte que le localisateur adapte l'analyseur de manière générale plutôt que de connaître un champ spécifique.

Un localisateur prend le `Request` d'Express et renvoie les fichiers téléversés regroupés par nom de champ de formulaire — un `Record<string, File[]>` indexé par nom de champ. Comme formidable n'est pas une middleware, analysez vous-même la requête et attachez le résultat ; le localisateur le transmet ensuite à Express-Cargo :

```typescript
import express, { Request, Response, NextFunction } from 'express'
import formidable, { File } from 'formidable'
import { setCargoFileLocator } from 'express-cargo'

// 1. formidable n'est pas une middleware — analysez la requête vous-même et attachez le résultat.
//    En v3, `files` est déjà indexé par nom de champ avec un tableau par champ.
async function parseMultipart(req: Request, _res: Response, next: NextFunction) {
    const [, files] = await formidable().parse(req)
    ;(req as any).files = files // Record<string, File[]>
    next()
}

// 2. Enregistrez le localisateur une fois au démarrage pour qu'Express-Cargo lise ces fichiers.
setCargoFileLocator((req: Request): Record<string, File[]> => (req as any).files ?? {})
```

Chaque champ est associé à un **tableau**, même celui qui porte un seul fichier : `@UploadedFile()` prend la première entrée du tableau de son champ, tandis que `@UploadedFiles()` prend tout le tableau. Seule la logique de localisation est spécifique à l'analyseur ; les objets fichier eux-mêmes sont toujours liés tels quels.

Comme les fichiers sont liés tels quels, leur type et leurs noms de propriété proviennent de l'analyseur : multer expose `originalname` et `buffer`, tandis que formidable expose `originalFilename` et `filepath`. Typez chaque champ du DTO avec le type de fichier de l'analyseur que vous utilisez, et lisez les propriétés que cet analyseur fournit.
