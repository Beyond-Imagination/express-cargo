# 默认字段装饰器

Express-Cargo 提供用于为请求字段定义默认值的装饰器。当传入请求没有提供某个值（undefined 或 null）时，该装饰器会自动赋予默认值。

## 内置默认值装饰器

### `@Default(value: T)`

当请求没有提供某个类属性时，@Default 装饰器会为该属性赋予默认值。

- **`value`**：当请求中不存在该字段时要赋予的默认值。

```typescript
class Request {
    @Body()
    @Default(1)
    price!: number;
}
```
