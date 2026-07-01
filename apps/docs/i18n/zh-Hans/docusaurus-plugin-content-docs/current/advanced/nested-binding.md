# 嵌套对象绑定

Express-Cargo 允许你处理请求中的嵌套对象，并在支持递归类型转换和验证的同时，将其自动绑定到嵌套对象。

## 使用示例

```typescript
import express, { Request, Response } from 'express'
import { Body, Type, bindingCargo, getCargo } from 'express-cargo'

// 1. 定义嵌套对象
class Profile {
    @Body('nickname')
    nickname!: string
}

class ExampleObject {
    @Body('profile')
    @Type(() => Profile)
    profile!: Profile
}

// 2. 设置 Express 应用和路由
const app = express()
app.use(express.json())

app.post('/submit', bindingCargo(ExampleObject), (req: Request, res: Response) => {
    const requestData = getCargo<ExampleObject>(req)

    res.json({
        message: 'Nested bound successfully!',
        data: requestData,
    })
})

/*
要测试此端点，请向 /submit 发送 POST 请求。

示例请求 URL：
http://localhost:3000/submit
*/
```

## 输出示例

当发送包含嵌套 profile 对象的 POST 请求时，`bindingCargo` 中间件会自动实例化并验证嵌套的 `ExampleObject`。随后 `getCargo` 函数会返回包含嵌套数据且填充完整的对象：

```json
{
    "message": "Nested bound successfully!",
    "data": {
        "profile": {
            "nickname": "coder123"
        }
    }
}
```
