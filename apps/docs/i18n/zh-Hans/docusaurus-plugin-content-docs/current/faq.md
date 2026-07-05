---
title: 常见问题
sidebar_label: 常见问题
---

这里整理了使用该库时的常见问题。点击问题即可展开答案。

### 1. 快速开始

<details>
<summary><b>Q: express-cargo 项目是什么？</b></summary>

**A:** 它是一个中间件，旨在用基于类的方式自动化 Express.js 中重复且繁琐的请求数据处理（`req.body`、`req.query` 等）。通过 TypeScript 装饰器，你可以在一个地方以声明式方式处理数据绑定和验证。
</details>

<details>
<summary><b>Q: 安装时有什么注意事项？</b></summary>

**A:** 推荐使用 **Node.js 20 或更高版本**。它被设计为标准中间件，可以灵活集成到现有 Express 项目中。
</details>

<details>
<summary><b>Q: TypeScript 配置是必需的吗？</b></summary>

**A:** 是的。因为它使用装饰器，你必须在 `tsconfig.json` 中将以下两个选项设置为 `true`：
- `experimentalDecorators: true`
- `emitDecoratorMetadata: true`

此外，还必须安装 `reflect-metadata` 包，以便在运行时读取类型信息。
</details>

### 2. 数据绑定与装饰器

<details>
<summary><b>Q: `@Body` 和 `@Query` 有什么区别？</b></summary>

**A:** 区别在于数据提取来源：
- **`@Body`**：从 HTTP Request body 中提取数据。主要用于 `POST` 和 `PUT` 请求。
- **`@Query`**：从 URL 查询字符串中提取参数（例如 `?id=1&name=test`）。主要用于 `GET` 请求中的过滤或排序。
- 你也可以使用 `@Params()`（或 `@Uri()`）、`@Header()`、`@Session()` 绑定其他类型的请求数据。
</details>

<details>
<summary><b>Q: @Uri() 是什么？它和 @Params() 不同吗？</b></summary>

**A:** `@Uri()` 是 `@Params()` 的**别名**。绑定 URL 路径参数（例如 `/:id`）时，你可以根据可读性偏好选择使用哪一个。
</details>

<details>
<summary><b>Q: 如何获取已绑定的数据？</b></summary>

**A:** 在路由中通过 `bindingCargo(ClassName)` 中间件后，你可以在处理器里调用 `getCargo<ClassName>(req)` 函数来获取实例。
</details>

### 3. 验证与转换

<details>
<summary><b>Q: 验证失败会如何处理？</b></summary>

**A:** 验证会在内部使用 `@Min`、`@Max`、`@Length` 等装饰器执行。如果检测到无效数据，中间件会自动返回错误响应或抛出异常。
</details>

<details>
<summary><b>Q: 如何处理或转换字段值？</b></summary>

**A:** 使用 **`@Transform()`** 装饰器。例如，编写 `@Transform(v => v.trim())` 可以在绑定前将输入数据转换为期望格式。
</details>

<details>
<summary><b>Q: 如果某个字段缺失，如何避免错误？</b></summary>

**A:** 使用 **`@Optional()`** 装饰器。即使该字段值为 `null` 或 `undefined`，也可以成功绑定，并跳过该字段的验证。如果想改为填充一个后备值，请使用 `@Default()`。参见[处理缺失字段](./decorators/missing-fields.md)。
</details>

### 4. 框架兼容性

<details>
<summary><b>Q: 可以和 Fastify 或 NestJS 一起使用吗？</b></summary>

**A:** 该库专门设计为 **Express.js 专用中间件**。
- **NestJS**：NestJS 自带 `ValidationPipe` 和装饰器，功能上可能重叠。虽然在使用 Express adapter 时技术上可行，但该库的主要目标是提升纯 Express 环境中的 DX。
- **Fastify**：目前未提供官方支持。
</details>

### 5. 故障排查

<details>
<summary><b>Q: 为什么我的类实例数据返回 `undefined`？</b></summary>

**A:** 请检查以下两点：
- 是否在 `bindingCargo` **之前**声明了类似 `express.json()` 的 body 解析中间件？
- 是否在应用入口文件的最顶部导入了 `reflect-metadata`？
</details>

<details>
<summary><b>Q: 会发生自动类型转换吗？</b></summary>

**A:** 会。它会根据类字段中定义的类型（`string`、`number`、`boolean` 等）尝试自动转换值。例如，来自 `@Query()` 的字符串 `"123"`，如果字段类型定义为 `number`，会自动转换为数字。
</details>

### 6. 其他

<details>
<summary><b>Q: 可以在商业项目中免费使用吗？</b></summary>

**A:** 该库基于 **MIT License** 授权。你可以自由使用、修改和分发，包括用于商业用途，不受限制。
</details>
