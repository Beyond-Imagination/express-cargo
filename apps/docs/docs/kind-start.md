## 🚀 Getting Started with express-cargo
This document provides a minimum configuration guide for **quickly experiencing express-cargo in a TypeScript + Express environment**.
The examples are based on **pnpm + Node.js 18 or later**.

---

### 1. Requirements

- Node.js **18 or later (LTS recommended)**

Package Manager: npm | yarn | pnpm
→ This document uses pnpm.

> Since express-cargo uses Decorator + Metadata, TypeScript is recommended.

---

### 2. Installing Node.js
Install the LTS version appropriate for your OS from the official website below.

- Node.js Official Download
    https://nodejs.org


Verify installation:
```shell
node -v
pnpm -v
```
If successful, the version will be displayed.

---

### 3. Create a new project (pnpm)

[//]: # (####   npm)

[//]: # (```typescript)

[//]: # (mkdir express-cargo-example)

[//]: # (cd express-cargo-example)

[//]: # (npm init -y)

[//]: # (```)

#### pnpm
```shell
mkdir express-cargo-example
cd express-cargo-example
pnpm init
```

### 4. Set up the TypeScript environment
#### 4-1. Install TypeScript and development dependencies
```shell
pnpm add -D typescript ts-node @types/node
```

#### 4-2. Create tsconfig.json 생성
```shell
pnpm tsc --init
```
#### 4-3. Recommended tsconfig settings
```json
{
  "compilerOptions": {
    "target": "ES2020",                 // Decorator + 최신 문법 안정성
    "module": "commonjs",
    "moduleResolution": "node",
    "experimentalDecorators": true,     // express-cargo 필수
    "emitDecoratorMetadata": true,      // 타입 메타데이터 사용
    "esModuleInterop": true,
    "sourceMap": true,
    "outDir": "dist",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

>⚠️ experimentalDecorators, emitDecoratorMetadata Without it,
> validation/transformation in express-cargo will not work.

---

### 5. Install express & express-cargo
```shell
pnpm add express express-cargo
pnpm add -D @types/express
```

---

### 6. package.json example
```json
{
  "name": "express-cargo-docs-example",
  "version": "1.0.0",
  "description": "express-cargo example",
  "main": "index.js",
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon",
    "build": "rm -rf dist && swc src -d dist --source-maps --copy-files"
    "start": "node dist/src/app.js",
  },
  "dependencies": {
    "express": "^5.2.1",
    "express-cargo": "^0.5.1",
    "express-session": "^1.19.0",
    "cross-env": "^7.0.3",
    "tslib": "^2.8.1"
  },
  "devDependencies": {
    "@swc-node/register": "^1.11.1",
    "@swc/cli": "^0.5.2",
    "@swc/core": "^1.15.10",
    "@swc/helpers": "^0.5.18",
    "@types/express": "^5.0.6",
    "@types/express-session": "^1.18.2",
    "nodemon": "^3.1.11",
    "swc-node": "^1.0.0"
  }
}
```

#### 7. tsconfig.json example
```json
{
    "compileOnSave": false,
    "compilerOptions": {
        "target": "es2017",
        "lib": ["es2017", "esnext.asynciterable"],
        "typeRoots": ["node_modules/@types"],
        "allowSyntheticDefaultImports": true,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "forceConsistentCasingInFileNames": true,
        "moduleResolution": "node",
        "module": "commonjs",
        "pretty": true,
        "sourceMap": true,
        "declaration": true,
        "outDir": "dist",
        "allowJs": true,
        "noEmit": false,
        "esModuleInterop": true,
        "resolveJsonModule": true,
        "importHelpers": true,
        "baseUrl": "./src",
        "paths": {
            "@/*": ["*"]
        }
    },
    "include": ["src/**/*.ts", "src/**/*.json", ".env"],
    "exclude": ["node_modules"]
}
```

### 8. Base server + express-cargo settings
#### 8-1. `src/app.ts`

```typescript
import express from 'express'
import cargo = require('express-cargo')
import errorHandlerRouter from './errorHandler'
const { bindingCargo, getCargo, Body, Query, Header, Params, Min, Max, Equal, NotEqual, Prefix, Suffix } = cargo

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(errorHandlerRouter)

app.listen(port, () => {console.log(`Example app listening on port ${port}`)})


class ExampleRequest {


  @Body()
  @Equal('1')
  id!: string
}

app.post('/example', bindingCargo(ExampleRequest), (req, res) => {
  const cargo = getCargo<ExampleRequest>(req)
  res.json(cargo)
})
```
**Operation Description**

- `@Body()`

    → Extract fields from the request body

- `@Equal('1')`

    → If the value is not "1", a validation error occurs

- `bindingCargo(Class)`

    → Request → DTO conversion + validation

- `getCargo(req)`

    → Return a validated type-safe object

### 9. 실행
```shell
npm run dev
```
test request:

```
POST http://localhost:3000/example
Content-Type: application/json

{
  "id": "1"
}

```

response:

```
{ "id": "1" }
```

- ❌ `"id": "2"` → Validation Error occurs

### 10. Setting up an error handler
`src/errorHandler.ts`
```typescript
import express, { NextFunction, Request, Response, Router } from 'express'
import {
    bindingCargo,
    Body,
    CargoFieldError,
    CargoTransformFieldError,
    CargoValidationError,
    Email,
    getCargo,
    getCargoErrorHandler,
    MaxLength,
    setCargoErrorHandler,
    Transform,
} from 'express-cargo'

const router: Router = express.Router()


/**
 * Wrapper for delegating to Express' default error handling
 */
const saveAndBypassErrorHandler = (req: Request, res: Response, next: NextFunction) => {
    const originalHandler = getCargoErrorHandler()

    res.on('finish', () => {
        if (originalHandler) {
            setCargoErrorHandler(originalHandler)
        }
    })

    setCargoErrorHandler((error: CargoValidationError, req, res, next) => next(error))
    next()
}

const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof CargoValidationError) {
        res.status(400).json({
            name: error.name,
            errors: error.errors,
            message: error.message,
        })
    } else if (error instanceof CargoTransformFieldError || error instanceof CargoFieldError) {
        res.status(400).json({
            name: error.name,
            field: error.field,
            message: error.message,
        })
    } else {
        res.status(500).json({
            name: 'Internal Server Error',
            message: error.message,
        })
    }
}

class ErrorHandlerExample {
    @Body()
    @MaxLength(10)
    name!: string

    @Body()
    @Email()
    @Transform((target: string) => target.toLowerCase())
    email!: string
}

router.use(saveAndBypassErrorHandler)

router.post('/error-handler', bindingCargo(ErrorHandlerExample), (req, res) => {
    const cargo = getCargo<ErrorHandlerExample>(req)
    res.json(cargo)
})

router.use(errorHandler)

export default router

```

- Validation/Transform errors are returned as structured JSON

- Works seamlessly with Express's global error handling
