## 继承绑定

字段装饰器也会应用到父类中声明的字段。  
这使你可以在**基类**中定义通用字段，然后在**子类**中扩展或覆盖它们。

### 示例

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

### 结果

`CreateUserRequest` 将包含以下字段：

- id：继承自 `BaseRequest`

- role：定义在 `CreateUserRequest` 中
