# 继承绑定

字段装饰器也会应用到父类中声明的字段。  
这使你可以在**基类**中一次性定义通用字段，并在多个**子类**中复用它们。

## 示例

```typescript
class BaseRequest {
  @Body()
  @Length(10)
  id!: string
}

class CreateUserRequest extends BaseRequest {
  @Body()
  @OneOf(["admin", "user"])
  role!: string
}
```

## 结果

`CreateUserRequest` 将包含以下字段：

- id：继承自 `BaseRequest`

- role：定义在 `CreateUserRequest` 中

当你将 `CreateUserRequest` 传给 `bindingCargo` 时，继承而来的 `id` 和本地声明的 `role` 会一起被绑定和验证。

## 重新声明继承的字段

在子类中重新声明一个继承的字段并**不会**替换父类的定义——两个类的装饰器会被合并到同一个字段上。以这种方式重复应用来源装饰器（例如在父类已用 `@Body()` 作为来源的字段上再次使用 `@Body()`）会产生 schema 错误：

```
Update.id: @Body + @Body cannot be combined; pick a single source
```

因此每个字段都应当只在一个类中声明。要更改某个字段的绑定或验证方式，请在它最初声明的位置修改，而不是在子类中重新声明。

## 注意事项

- 字段会沿整个原型链收集，因此支持多层继承。
