# 装饰器概览

## 什么是装饰器？

express-cargo 中的装饰器用于标注类字段，告诉中间件：

- 从哪里提取数据（例如 body、query）
- 如何验证数据
- 如何转换数据

当你将一个类传给 `bindingCargo` 时，中间件会读取这些装饰器，构建、验证并转换出一个类型安全的对象，你可以通过 `getCargo` 获取它。

## 装饰器分类

装饰器按照它们在绑定流程中所扮演的角色进行分组。

| 分类       | 用途                          | 示例                                                                                        | 参考                                                          |
|----------|-----------------------------|-------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| **来源**   | 选择字段值的来源                    | `@Body`、`@Query`、`@Header`、`@Uri` / `@Params`、`@Session`、`@UploadedFile`、`@UploadedFiles` | [来源装饰器](./source-decorators.md)、[文件上传装饰器](./file-upload.md) |
| **请求**   | 直接从 Express 的 `Request` 读取值 | `@Request`                                                                                | [虚拟字段装饰器](./virtual.md)                                     |
| **虚拟**   | 从对象的其他字段计算出字段               | `@Virtual`                                                                                | [虚拟字段装饰器](./virtual.md)                                     |
| **转换**   | 在绑定前修改单个字段的值                | `@Transform`                                                                              | [转换装饰器](./transforms.md)                                    |
| **类型助手** | 决定原始值如何被解释和转换               | `@Type`、`@List`、`@Enum`                                                                   | [类型助手装饰器](./type-helpers.md)                                |
| **验证**   | 对字段值强制执行规则                  | `@Min`、`@Max`、`@Email`、`@OneOf`、…                                                         | [验证装饰器](./validators.md)                                    |
| **缺失值**  | 决定字段缺失时的处理方式                | `@Default`、`@Optional`                                                                    | [处理缺失字段](./missing-fields.md)                               |

**来源**、**请求** 和 **虚拟** 回答的是同一个问题——这个字段的值从哪里来——因此每个字段必须且只能带其中一个，不能混用。`@UploadedFile` 和 `@UploadedFiles` 是读取 multipart 解析器输出的来源装饰器，所以在同一个字段上同时使用 `@UploadedFile` 和 `@Body`，会像 `@Body` 与 `@Query` 一样被拒绝。

`@Type` 和 `@List` 更深入的场景——多态、循环引用、自定义类的数组——请参见 **进阶用法** 中的 [类型转换与多态](../advanced/type-and-polymorphism.md) 和 [List 装饰器](../advanced/list-decorator.md)。

## 组合使用装饰器

单个字段可以同时携带来自多个分类的装饰器。它们会被一起读取，用于绑定、转换和验证该字段：

```typescript
import { Body, Transform, MinLength } from 'express-cargo'

class CreateUserRequest {
    @Body('email')                              // 来源：从 req.body.email 读取
    @Transform((value: string) => value.trim()) // 转换：规范化值
    @MinLength(5)                               // 验证：强制执行规则
    email!: string
}
```

限制发生在同一分类内部，而不是跨分类：一个字段只能有一个来源、一个类型助手和一种缺失值策略，而验证装饰器可以自由叠加。`bindingCargo()` 会在注册路由时检查这些规则，并在服务器处理请求之前抛出 `CargoSchemaError`。

上面链接的每个分类都有各自的文档页面。
