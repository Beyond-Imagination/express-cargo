## inherited-binding

Field decorators are also applied to fields declared in parent classes.  
This allows you to define common fields in a **base class** and then extend or override them in **child classes**.

### Example
```typescript
class BaseRequest {
  @body()
  @length(10)
  id!: string
}

class CreateUserRequest extends BaseRequest {
  @body()
  @oneOf(["admin", "user"])
  role!: string
}
```

### Result
`CreateUserRequest` will have the following fields:

- id : inherited from `BaseRequest`

- role : defined in `CreateUserRequest`
