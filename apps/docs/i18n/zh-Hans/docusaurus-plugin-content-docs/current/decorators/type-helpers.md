# 类型助手装饰器

类型助手告诉绑定器在验证运行之前 **如何解释字段的值**。它们决定嵌套对象会变成哪个类、数组的每个元素转换为什么类型，以及原始字符串映射到哪个枚举成员。

`@Type`、`@List` 和 `@Enum` 构成同一个分类。一个字段最多只能应用其中一个。

## `@Type(typeFn: TypeThunk | TypeResolver, options?: TypeOptions)`

将普通 JSON 对象转换为目标类的实例。

- **`typeFn`**：返回目标类的函数。固定类型使用 thunk `() => Class`，需要根据原始数据选择类时使用 resolver `(data) => Class`。
- **`options.discriminator`**（可选）：形如 `{ property, subTypes: [{ name, value }] }` 的结构映射。类由 `property` 的值选定。

`@Type` 不能应用于 `String`、`Number` 或 `Boolean` 字段。

```typescript
class User {
    @Body()
    @Type(() => Profile)
    profile!: Profile
}
```

嵌套映射、循环引用和动态解析请参见 [类型转换与多态](../advanced/type-and-polymorphism.md)。

## `@List(elementType: ArrayElementType)`

声明数组字段的元素类型，使每个元素单独转换。

- **`elementType`**：`String`、`Number`、`Boolean`、`Date`、类构造函数，或字符串字面量 `'string'`、`'number'`、`'boolean'`、`'date'` 之一。

`@List` 只能应用于数组字段。

```typescript
class ListSample {
    @Body()
    @List(Number)
    scores!: number[]
}
```

完整示例请参见 [List 装饰器](../advanced/list-decorator.md)。

## `@Enum(enumObj: object, message?: string)`

将传入值映射到 `enumObj` 的成员，并拒绝不属于成员的值。

- **`enumObj`**：用于映射的 enum 对象。
- **`message`**（可选）：值不是成员时显示的错误消息。省略时使用默认消息。

enum 的 key（`'ADMIN'`）和 value（`'admin'`、`0`）都可作为输入，绑定后的字段始终保存 enum 的 value。数字字符串按数值比较，因此 `'0'` 会匹配值为 `0` 的成员。

```typescript
enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

class UpdateRoleRequest {
    @Body('role')
    @Enum(UserRole)
    role!: UserRole
}
```

`@Enum` 既转换也检查值，但它是 **类型助手**，而不是[验证装饰器](./validators.md)。由此得出两个结论：

- `@Each` 只能包裹验证装饰器，因此 `@Each(Enum(UserRole))` 会被拒绝。
- `@Enum` 会安装自己的转换器，因此不能与 `@Transform` 同时使用。

## 模式规则

`bindingCargo()` 在注册路由时检查以下规则，而不是在第一个请求时。违反会在启动时抛出 `CargoSchemaError`。

| 规则               | 违反消息                                                                           |
|------------------|--------------------------------------------------------------------------------|
| 每个字段只能有一个类型助手    | `@List + @Type cannot be combined; apply a single one of @Type/@List/@Enum`    |
| `@List` 需要数组字段   | `@List can only be applied to array fields`                                    |
| `@Type` 拒绝原始类型字段 | `@Type cannot be applied to a primitive field`                                 |
| `@Each` 不能包裹类型助手 | `@Each cannot wrap type-helper decorator(s): @Enum`                            |
| 转换器归 `@Enum` 所有  | `@Enum cannot be combined with @Transform; @Enum installs its own transformer` |

消息中列出的是你实际应用的装饰器，按求值顺序（自下而上）排列，因此开头部分会随你的代码而变化。
