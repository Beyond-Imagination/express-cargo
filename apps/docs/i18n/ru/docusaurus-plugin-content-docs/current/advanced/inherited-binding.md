## Наследование привязки

Декораторы полей также применяются к полям, объявленным в родительских классах.
Это позволяет вам определять общие поля в **базовом классе**, а затем расширять или переопределять их в **дочерних классах**.

### Пример
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

### Результат
`CreateUserRequest` будет иметь следующие поля:

- id : унаследовано от `BaseRequest`

- role : определено в `CreateUserRequest`
