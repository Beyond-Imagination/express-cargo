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

#### 4-2. Create tsconfig.json
```shell
pnpm tsc --init
```
#### 4-3. Recommended tsconfig settings
```json
{
  "compilerOptions": {
    ...,
    "experimentalDecorators": true,     // express-cargo required
    "emitDecoratorMetadata": true,      // use type metadata
    ...
  },
  ...
}
```

>⚠️ experimentalDecorators, emitDecoratorMetadata Without it,
> validation/transformation in express-cargo will not work.

---

### 5. Install express & express-cargo
```shell
pnpm add express express-cargo
pnpm add -D @types/express
pnpm add reflect-metadata
```

---

### 6. Base server + express-cargo settings
#### 6-1. `src/app.ts`

```typescript
import express from 'express'
import { bindingCargo, getCargo, Body, Query, Header, Params, Min, Max, Equal, NotEqual, Prefix, Suffix } from 'express-cargo'
import errorHandlerRouter from './errorHandler'

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(errorHandlerRouter)

app.listen(port, () => {console.log(`Example app listening on port ${port}`)})

class ExampleRequest {
  @Body() // Extract fields from the request body
  @Equal('1') // If the value is not "1", a validation error occurs
  id!: string
}

app.post('/example', bindingCargo(ExampleRequest), (req, res) => { // bindingCargo(Class): Request → DTO conversion + validation
  const cargo = getCargo<ExampleRequest>(req) // Return a validated type-safe object
  res.json(cargo)
})
```

### 7. Run
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
