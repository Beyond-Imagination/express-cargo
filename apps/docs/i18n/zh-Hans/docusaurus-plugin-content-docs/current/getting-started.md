## 🚀 express-cargo 快速开始

本文档提供一个最小配置指南，帮助你在 **TypeScript + Express 环境中快速体验 express-cargo**。
示例基于 **pnpm + Node.js 18 或更高版本**。

---

### 1. 要求

- Node.js **18 或更高版本（推荐 LTS）**

包管理器：npm | yarn | pnpm
→ 本文档使用 pnpm。

> 由于 express-cargo 使用 Decorator + Metadata，推荐使用 TypeScript。

---

### 2. 安装 Node.js

请从下方官方网站安装适合你操作系统的 LTS 版本。

- Node.js 官方下载
    https://nodejs.org

验证安装：

```shell
node -v
pnpm -v
```

如果安装成功，将显示版本号。

---

### 3. 创建新项目（pnpm）

#### pnpm

```shell
mkdir express-cargo-example
cd express-cargo-example
pnpm init
```

### 4. 设置 TypeScript 环境

#### 4-1. 安装 TypeScript 和开发依赖

```shell
pnpm add -D typescript ts-node @types/node
```

#### 4-2. 创建 tsconfig.json

```shell
pnpm tsc --init
```

#### 4-3. 推荐的 tsconfig 设置

```json
{
  "compilerOptions": {
    ...,
    "experimentalDecorators": true,     // express-cargo 必需
    "emitDecoratorMetadata": true,      // 使用类型元数据
    ...
  },
  ...
}
```

>⚠️ 如果没有 experimentalDecorators 和 emitDecoratorMetadata，
> express-cargo 的验证/转换功能将无法工作。

---

### 5. 安装 express 和 express-cargo

```shell
pnpm add express express-cargo
pnpm add -D @types/express
pnpm add reflect-metadata
```

---

### 6. 基础服务器 + express-cargo 设置

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
  @Body() // 从请求 body 中提取字段
  @Equal('1') // 如果值不是 "1"，会发生验证错误
  id!: string
}

app.post('/example', bindingCargo(ExampleRequest), (req, res) => { // bindingCargo(Class)：Request → DTO 转换 + 验证
  const cargo = getCargo<ExampleRequest>(req) // 返回经过验证的类型安全对象
  res.json(cargo)
})
```

### 7. 运行

```shell
npm run dev
```

测试请求：

```
POST http://localhost:3000/example
Content-Type: application/json

{
  "id": "1"
}

```

响应：

```
{ "id": "1" }
```

- ❌ `"id": "2"` → 会发生验证错误
