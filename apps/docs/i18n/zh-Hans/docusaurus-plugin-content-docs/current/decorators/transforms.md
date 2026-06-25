# 转换装饰器

Express-Cargo 提供了一个装饰器，可以在请求数据绑定到类之前自动转换传入数据。它适用于规范化用户输入（例如将字符串转换为小写）或将逗号分隔的字符串解析为数组等任务。

与通过组合已有字段创建新字段的虚拟字段不同，该转换装饰器会直接修改单个字段的值。

## `@Transform<T>(transformer: (value: T) => T)`

这是用于数据转换的主要装饰器。它接收一个 transformer 函数，该函数接收来自请求的原始值，并返回字段的新转换值。

- `transformer`：接收原始值并返回转换后值的函数。

## 使用示例

此示例展示如何使用 `@Transform` 装饰器将请求数据规范化并处理成期望格式。它非常适合处理多样化的用户输入，并确保 API 以一致方式处理这些输入，从而提升应用稳定性。

```typescript
import express, { Request, Response } from 'express'
import { bindingCargo, getCargo, Query, Transform } from 'express-cargo'

// 1. 定义包含数据处理和规范化规则的类
class SearchRequest {
    // 将 'sortBy' 查询参数转换为小写，以便排序逻辑保持一致
    @Query()
    @Transform((value: string) => value.toLowerCase())
    sortBy!: string

    // 将 'count' 查询参数值翻倍
    @Query()
    @Transform((value: number) => value * 2)
    count!: number
}

const app = express()
app.use(express.json())

// 2. 将 bindingCargo 中间件应用到路由
app.get('/search', bindingCargo(SearchRequest), (req: Request, res: Response) => {
    // 3. 使用正确类型访问转换后的数据
    const searchParams = getCargo<SearchRequest>(req)

    res.json({
        message: 'Search parameters transformed successfully!',
        data: searchParams,
        // 验证转换后数据的类型
        sortByType: typeof searchParams.sortBy,
        countType: typeof searchParams.count,
    })
})

/*
要测试此端点，请向 /search 发送 GET 请求。

示例请求 URL：
http://localhost:3000/search?sortBy=TITLE&count=10
*/
```

## 输出示例

访问示例请求 URL 时，`bindingCargo` 中间件会处理 query 参数。随后 `@Transform` 装饰器会把 `sortBy` 值规范化为小写字符串，并将 `count` 值翻倍。`getCargo` 函数返回包含这些转换后值的对象。

```json
{
    "message": "Search parameters transformed successfully!",
    "data": {
        "sortBy": "title",
        "count": 20
    },
    "sortByType": "string",
    "countType": "number"
}
```
