# List 装饰器

Express-Cargo 的 `@List` 装饰器允许你从请求中自动绑定并转换数组类型。当你期望某个字段是特定类型的数组时，例如字符串、数字，甚至自定义对象，这会非常有用。

## 使用示例

```typescript
import express, { Router } from 'express'
import { Body, List, bindingCargo, getCargo } from 'express-cargo'

const router: Router = express.Router()

// 1. 定义自定义类（可选）
class CustomClass {
    @Body()
    name!: string

    @Body()
    age!: number
}

// 2. 定义包含数组字段的类
class ListSample {
    @Body()
    @List(String)
    stringArray!: string[]

    @Body()
    @List(Number)
    numberArray!: number[]

    @Body()
    @List(Boolean)
    booleanArray!: boolean[]

    @Body()
    @List(Date)
    dateArray!: Date[]

    @Body()
    @List('string')
    stringLiteralArray!: string[]

    @Body()
    @List(CustomClass)
    customClassArray!: CustomClass[]
}

// 3. 设置 Express 路由
router.post('/list', bindingCargo(ListSample), (req, res) => {
    const cargo = getCargo<ListSample>(req)
    res.json(cargo)
})

export default router
```

## 输出示例

如果你向 `/list` 发送如下 JSON body 的 POST 请求：

```json
{
    "stringArray": ["apple", "banana"],
    "numberArray": [1, 2, 3],
    "booleanArray": [true, false],
    "dateArray": ["2024-01-01", "2024-01-02"],
    "stringLiteralArray": ["one", "two"],
    "customClassArray": [
        { "name": "John", "age": 30 },
        { "name": "Jane", "age": 25 }
    ]
}
```

`getCargo` 函数将返回填充完整的 `ListSample` 对象：

```typescript
// getCargo<ListSample>(req) 返回的对象：
const cargo = {
  stringArray: ["apple", "banana"],
  numberArray: [1, 2, 3],
  booleanArray: [true, false],
  dateArray: [
    // 这些是真正的 Date 对象
    new Date("2024-01-01T00:00:00.000Z"),
    new Date("2024-01-02T00:00:00.000Z")
  ],
  stringLiteralArray: ["one", "two"],
  customClassArray: [
    // 这些是 CustomClass 的实例
    { name: "John", age: 30 },
    { name: "Jane", age: 25 }
  ]
};
```
