# 装饰器概览

## 什么是装饰器？

express-cargo 中的装饰器用于标注类字段，告诉中间件：

- 从哪里提取数据（例如 body、query）
- 如何验证数据
- 如何转换数据

当你将一个类传给 `bindingCargo` 时，中间件会读取这些装饰器，构建、验证并转换出一个类型安全的对象，你可以通过 `getCargo` 获取它。

## 装饰器分类

装饰器按照它们在绑定流程中所扮演的角色进行分组。

| 分类            | 用途                                        | 示例                                                         | 参考                                              |
|-----------------|---------------------------------------------|--------------------------------------------------------------|---------------------------------------------------|
| **来源**        | 选择字段值的来源                            | `@Body`、`@Query`、`@Header`、`@Uri` / `@Params`、`@Session` | [来源装饰器](./source-decorators.md)              |
| **文件**        | 绑定 `multipart/form-data` 请求中上传的文件 | `@UploadedFile`、`@UploadedFiles`                            | [文件上传装饰器](./file-upload.md)                |
| **虚拟**        | 从其他字段或原始 `Request` 计算出字段       | `@Virtual`、`@Request`                                       | [虚拟字段装饰器](./virtual.md)                    |
| **转换**        | 在绑定前修改单个字段的值                    | `@Transform`                                                 | [转换装饰器](./transforms.md)                     |
| **验证**        | 对字段值强制执行规则                        | `@Min`、`@Max`、`@Email`、`@OneOf`、…                        | [验证装饰器](./validators.md)                     |
| **缺失值**      | 决定字段缺失时的处理方式                    | `@Default`、`@Optional`                                      | [处理缺失字段](./missing-fields.md)               |

更多辅助装饰器在 **进阶用法** 中介绍，例如用于类型化数组的 [`@List`](../advanced/list-decorator.md)，以及用于嵌套和多态类型的 [`@Type`](../advanced/type-and-polymorphism.md)。

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

上面链接的每个分类都有各自的文档页面。
