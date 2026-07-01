# 处理缺失字段

当某个字段在**请求中缺失**（其值为 `undefined` 或 `null`）时，Express-Cargo 需要知道该如何处理。有两个装饰器可以控制这种行为：

- **`@Default(value)`** —— 填充一个后备值。
- **`@Optional()`** —— 允许字段保持为空，而不引发“必填”错误。

由于二者决定的是同一件事——字段缺失时会发生什么——所以它们是**互斥的**。同时把两者应用到一个字段上会抛出 schema 错误。

如果某个字段**两个装饰器都没有**且值缺失，则绑定会以 `<field> is required` 验证错误失败。

## `@Default(value: T)`

`@Default` 装饰器会在请求未提供某个类属性时，为其赋一个默认值。

- **`value`**：当字段在请求中不存在时要赋的默认值。

```typescript
class Request {
    @Body()
    @Default(1)
    price!: number;
}
```

### 何时应用默认值

只有当**传入值为 `undefined` 或 `null`**（即字段在请求中缺失）时才会应用默认值。来自请求的任何其他值都会原样保留。

这意味着诸如 `0`、`''` 和 `false` 之类的假值会被视为真实输入，**不会**触发默认值：

```typescript
class Request {
    @Body()
    @Default(10)
    quantity!: number
}
```

| 传入的 `quantity`     | 绑定后的值             |
|-----------------------|------------------------|
| 缺失 / `undefined`    | `10`（应用默认值）     |
| `null`                | `10`（应用默认值）     |
| `0`                   | `0`（保留）            |
| `5`                   | `5`（保留）            |

## `@Optional()`

`@Optional` 装饰器将字段标记为可选，允许它被省略或设置为 `undefined`/`null`，而不会触发“必填”错误。当字段缺失时，它会保持为 `null`，并跳过该字段上的验证规则。

```typescript
class Request {
    @Body()
    @Min(0)
    @Optional()
    discount?: number
}
```

这里缺失的 `discount` 会绑定为 `null`，并跳过 `@Min(0)` 规则。如果 `discount` **确实**被提供，则会正常验证。

## 在 `@Default` 与 `@Optional` 之间选择

| | 字段缺失 | 字段已提供 |
|---|---|---|
| `@Default(value)` | 绑定为 `value` | 保留并验证该值 |
| `@Optional()` | 绑定为 `null` | 保留并验证该值 |
| 都没有 | `<field> is required` 错误 | 保留并验证该值 |

每个字段只选择**一种**策略：

```typescript
class Request {
    // ❌ 无效：一个字段只能使用一种缺失值策略
    @Body()
    @Default(1)
    @Optional()
    price!: number
}
```
