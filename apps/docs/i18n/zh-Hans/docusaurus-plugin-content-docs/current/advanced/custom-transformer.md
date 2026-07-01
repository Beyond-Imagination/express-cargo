# 自定义转换器

`@Transform` 装饰器允许你定义自定义转换逻辑，该逻辑会在 Express-Cargo 的内置类型转换**之后**运行。它的用途是**细化值**，例如对类型已经确定的值进行规范化、限制范围或清理，而不是改变字段类型。

如需了解基本的 `@Transform` 用法，请参阅[转换装饰器](/decorators/transforms)页面。

:::note `@Transform` 细化的是值，而不是类型
由于内置类型转换（`String`、`Number`、`Boolean`、`Date`、`Array`）会在 transformer 之前运行，你的函数接收到的是已经转换类型后的值，并应返回相同类型。如果原始请求值与声明类型不匹配（例如逗号分隔字符串传入声明为 `string[]` 的字段），类型转换会在你的 transformer 运行前失败。

当你需要生成与原始来源不同形状的值时，例如把分隔字符串解析为数组、接受多种表示 true 的布尔写法等，请改用 [`@Request`](/decorators/virtual) 装饰器。它会完全绕过内置类型转换，并将 `Request` 对象直接交给你。请参阅下方[何时改用 `@Request`](#when-to-use-request-instead)一节。
:::

## 执行顺序

理解 `@Transform` 的运行时机非常重要：

1. 从请求来源（`@Query`、`@Body` 等）提取原始值
2. **内置类型转换**将该值转换为声明类型（`String`、`Number`、`Boolean`、`Date`）
3. **`@Transform`** 在已经完成类型转换的值上运行
4. **验证**应用到最终结果

这意味着你的 transformer 函数接收的是类型转换后的值，而不是原始字符串。

## 实用配方

### Enum 规范化

规范化用户输入，使其匹配期望的 enum 值：

```typescript
enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

class ListRequest {
    @Query()
    @Transform((value: string) => value.toLowerCase() as SortOrder)
    order!: SortOrder
}

// GET /list?order=DESC → { order: 'desc' }
```

### 清理字符串输入

移除不需要的字符或规范化空白：

```typescript
class CommentRequest {
    @Body()
    @Transform((value: string) => value.trim().replace(/\s+/g, ' '))
    content!: string
}

// POST { content: "  hello   world  " } → { content: "hello world" }
```

### 限制数字范围

确保数字保持在可接受范围内：

```typescript
class PaginationRequest {
    @Query()
    @Transform((value: number) => Math.min(Math.max(value, 1), 100))
    limit!: number
}

// GET /items?limit=500 → { limit: 100 }
// GET /items?limit=-5  → { limit: 1 }
```

### 日期处理

对解析后的日期应用调整：

```typescript
class ReportRequest {
    @Query()
    @Transform((value: Date) => {
        // 将时间设置为一天开始（00:00:00）
        value.setHours(0, 0, 0, 0)
        return value
    })
    startDate!: Date
}
```

## 与其他装饰器链式组合

`@Transform` 可以和其他 Express-Cargo 装饰器顺畅配合：

```typescript
class ProductQuery {
    @Query('q')
    @Transform((value: string) => value.toLowerCase().trim())
    @MinLength(1)
    searchTerm!: string

    @Query()
    @Default(10)
    @Transform((value: number) => Math.min(value, 50))
    limit!: number
}
```

:::tip
保持 transformer 函数简单，并专注于单一职责。如果你需要复杂的多步骤转换，可以考虑组合工具函数：

```typescript
const normalize = (v: string) => v.trim().toLowerCase()
const clamp = (min: number, max: number) => (v: number) => Math.min(Math.max(v, min), max)

class Request {
    @Query()
    @Transform(normalize)
    keyword!: string

    @Query()
    @Transform(clamp(1, 100))
    page!: number
}
```
:::

## 何时改用 `@Request` {#when-to-use-request-instead}

当请求值需要被重塑为不同类型，而不仅仅是细化时，`@Transform` 就不是合适工具，因为内置类型转换会先运行，并且可能失败或把值强制转换成与你期望不同的形式。使用 [`@Request`](/decorators/virtual) 可以绕过类型转换，并直接处理 `Request` 对象。

### 逗号分隔字符串转数组

```typescript
class SearchRequest {
    @Request(req => String(req.query.tags ?? '').split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// Result: { tags: ['node', 'express', 'cargo'] }
```

### 灵活解析布尔值

接受 `"yes"`、`"1"` 或 `"on"` 等多种表示 true 的写法，而不是只接受 `"true"`：

```typescript
class FilterRequest {
    @Request(req => {
        const raw = String(req.query.active ?? '').toLowerCase()
        return ['true', 'yes', '1', 'on'].includes(raw)
    })
    active!: boolean
}

// GET /filter?active=yes → { active: true }
// GET /filter?active=0   → { active: false }
```
