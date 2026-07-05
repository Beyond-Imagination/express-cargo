# 基础用法

本示例展示 **express-cargo** 最简单的端到端流程：定义一个请求类，用 `bindingCargo` 中间件进行绑定，然后用 `getCargo` 读取已验证的结果。

> 本页仅聚焦于绑定流程。关于项目搭建（TypeScript、`tsconfig`、安装依赖），请参见[快速开始](../getting-started.md)。

## 1. 定义请求类

声明一个类，并使用来源装饰器（这里是 `@Body()`）将每个字段映射到传入请求的某个部分。

```typescript
// create-user.request.ts
import { Body } from 'express-cargo'

export class CreateUserRequest {
    @Body('name')
    name!: string

    @Body('email')
    email!: string
}
```

## 2. 应用中间件

将请求类传给 `bindingCargo`，并把它注册为路由上的中间件。中间件会在你的处理器运行之前绑定并验证请求。

```typescript
import express from 'express'
import { bindingCargo, getCargo } from 'express-cargo'
import { CreateUserRequest } from './create-user.request'

const app = express()
app.use(express.json())

app.post('/users', bindingCargo(CreateUserRequest), (req, res) => {
    // 3. 读取已绑定的、类型安全的对象
    const user = getCargo<CreateUserRequest>(req)

    res.json({
        message: 'User created!',
        data: user,
    })
})
```

## 3. 请求示例

```json
{
    "name": "Jane Doe",
    "email": "jane@example.com"
}
```

## 4. 结果示例

`getCargo<CreateUserRequest>(req)` 返回一个完整填充的 `CreateUserRequest` 实例：

```json
{
    "message": "User created!",
    "data": {
        "name": "Jane Doe",
        "email": "jane@example.com"
    }
}
```

## 后续步骤

- 从其他来源提取数据（`@Query`、`@Header`、`@Params`）——参见[来源装饰器](../decorators/source-decorators.md)
- 添加 `@Min`、`@Email` 等验证规则——参见[验证装饰器](../decorators/validators.md)
- 绑定嵌套对象——参见[处理嵌套请求](./nested-request.md)
- 处理验证失败——参见[错误处理](./validation-errors.md)
