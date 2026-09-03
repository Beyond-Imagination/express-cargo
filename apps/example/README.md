# express-cargo example

An Express app that shows how to use `express-cargo`. Every decorator the library exports is wired
up to a route here, so the app doubles as the manual test harness for the package.

## Running

```shell
pnpm install
pnpm dev
```

The server listens on `http://localhost:3000` and resolves `express-cargo` from
`packages/express-cargo` through the workspace link, so library changes are picked up on restart.

## Usage

Declare a class, annotate its fields, and hand the class to `bindingCargo()`. The middleware reads
the decorators to build, validate and transform the object, and `getCargo()` returns it:

```typescript
import express from 'express'
import { Body, Query, MinLength, Optional, bindingCargo, getCargo } from 'express-cargo'

class CreatePostRequest {
    @Body()
    @MinLength(2)
    title!: string

    @Body()
    content!: string

    @Query()
    @Optional()
    draft?: boolean
}

const router = express.Router()

router.post('/posts', bindingCargo(CreatePostRequest), (req, res) => {
    const cargo = getCargo<CreatePostRequest>(req)
    res.json(cargo)
})
```

Binding failures never reach the route handler. `src/errors/cargoErrorHandler.ts` registers a global
handler with `setCargoErrorHandler` that answers them with a 422, except on `/error-handler`, which
shows how to catch them with an ordinary Express error handler instead.

## Project structure

`src/routers` mirrors `packages/express-cargo/src`, so a route leads straight to the module it
covers:

```
src/
├── app.ts                        mounts every router
├── errors/
│   └── cargoErrorHandler.ts      global cargo error handler
└── routers/
    ├── decorators/
    │   ├── source.ts             @Body @Query @Params/@Uri @Header @Session
    │   ├── file.ts               @UploadedFile @UploadedFiles
    │   ├── transform.ts          @Transform @Request @Virtual
    │   ├── typeHelper.ts         type casting, @List, @Enum
    │   ├── missingHandler.ts     @Optional @Default
    │   └── validators/           one file per validator category
    ├── errorHandler.ts           catching cargo errors with an Express error handler
    └── advanced/
        ├── inheritance.ts        decorators declared on a base class
        ├── polymorphism.ts       @Type with nested and polymorphic values
        ├── integration.ts        several decorator categories on one class
        └── passport.ts           binding an authenticated req.user
```

## Sending requests

[REQUESTS.md](./REQUESTS.md) carries a ready-made request for every route in this app.

## Documentation

| Router | Reference |
|--------|-----------|
| `decorators/source.ts` | [Source Decorators][source] |
| `decorators/file.ts` | [File Upload Decorators][file-upload] |
| `decorators/transform.ts` | [Transformation][transforms], [Virtual Fields][virtual] |
| `decorators/typeHelper.ts` | [Type Helper Decorators][type-helpers] |
| `decorators/missingHandler.ts` | [Handling Missing Fields][missing-fields] |
| `decorators/validators/` | [Validation Decorators][validators] |
| `advanced/inheritance.ts` | [Inherited Binding][inherited-binding] |
| `advanced/polymorphism.ts` | [Type & Polymorphism][polymorphism] |
| `advanced/integration.ts` | [Basic Usage][basic-usage] |

[source]: https://beyond-imagination.github.io/express-cargo/decorators/source-decorators
[file-upload]: https://beyond-imagination.github.io/express-cargo/decorators/file-upload
[transforms]: https://beyond-imagination.github.io/express-cargo/decorators/transforms
[virtual]: https://beyond-imagination.github.io/express-cargo/decorators/virtual
[type-helpers]: https://beyond-imagination.github.io/express-cargo/decorators/type-helpers
[missing-fields]: https://beyond-imagination.github.io/express-cargo/decorators/missing-fields
[validators]: https://beyond-imagination.github.io/express-cargo/decorators/validators
[inherited-binding]: https://beyond-imagination.github.io/express-cargo/advanced/inherited-binding
[polymorphism]: https://beyond-imagination.github.io/express-cargo/advanced/type-and-polymorphism
[basic-usage]: https://beyond-imagination.github.io/express-cargo/examples/basic-usage
