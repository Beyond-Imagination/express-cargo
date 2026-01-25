## 🚀 Getting Started with express-cargo
이 문서는 **TypeScript + Express 환경에서 express-cargo를 빠르게 체험**하기 위한 최소 구성 가이드입니다.
예제는 **pnpm + Node.js 18 이상**을 기준으로 설명합니다.

---

### 1. 요구사항

- Node.js **18 이상 (LTS 권장)**

패키지 매니저: npm | yarn | pnpm
→ 본 문서에서는 pnpm 사용

>express-cargo는 Decorator + Metadata를 사용하므로 TypeScript 사용을 권장합니다.

---

### 2. Node.js 설치
아래 공식 사이트에서 OS에 맞는 LTS 버전을 설치합니다.

- Node.js 공식 다운로드
    https://nodejs.org


설치 확인:
```shell
node -v
pnpm -v
```
정상이라면 버전이 출력됩니다.

---

### 3. 새 프로젝트 생성 (pnpm)

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

### 4. TypeScript 기본 환경 설정
#### 4-1. TypeScript 및 개발 의존성 설치
```shell
pnpm add -D typescript ts-node @types/node
```

#### 4-2. tsconfig.json 생성
```shell
pnpm tsc --init
```
#### 4-3. 권장 tsconfig 설정
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

>⚠️ experimentalDecorators, emitDecoratorMetadata가 없으면
express-cargo의 validation / transform이 동작하지 않습니다.

---

### 5. express & express-cargo 설치
```shell
pnpm add express express-cargo
pnpm add -D @types/express
```

---

### 6. package.json 예시
```json
{
  "name": "express-cargo-docs-example",
  "version": "1.0.0",
  "description": "express-cargo example",
  "main": "index.js",
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon",
    "build": "rm -rf dist && swc src -d dist --source-maps --copy-files",
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

#### 7. tsconfig.json 예시
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

### 8. 기본 서버 + express-cargo 설정
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
**동작 설명**

- `@Body()`

    → 요청 body에서 필드 추출

- `@Equal('1')`

    → 값이 "1"이 아니면 validation error

- `bindingCargo(Class)`

    → 요청 → DTO 변환 + 검증

- `getCargo(req)`

    → 검증 완료된 타입 안전 객체 반환

### 9. 실행
```shell
npm run dev
```
요청 테스트:

```
POST http://localhost:3000/example
Content-Type: application/json

{
  "id": "1"
}

```

응답:

```
{ "id": "1" }
```

- ❌ `"id": "2"` → Validation Error 발생

### 10. 에러 핸들러 설정
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
 * express 기본 에러 핸들링으로 위임하기 위한 래퍼
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

- Validation / Transform 에러를 구조화된 JSON으로 응답

- express 전역 에러 핸들링과 충돌 없이 동작
