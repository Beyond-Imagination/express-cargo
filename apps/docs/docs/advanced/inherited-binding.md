## inherited-binding

### Behavior

- Field decorators are **inherited** through the prototype chain.
- `getFieldList` collects metadata from the current class and all its parent classes (excluding `Object.prototype`).
- Child fields can override parent fields with the same name.
- `getFieldList` is only invoked inside **source-decorators**.  
  To use inheritance correctly, you must enable it together with source-decorators.

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
The resulting field list of CreateUserRequest is:

- id (inherited from BaseRequest)

- role (defined in CreateUserRequest)