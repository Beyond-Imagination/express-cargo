# Inherited Binding

Field decorators are also applied to fields declared in parent classes.  
This lets you define common fields once in a **base class** and reuse them across **child classes**.

## Example
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

## Result
`CreateUserRequest` will have the following fields:

- id : inherited from `BaseRequest`

- role : defined in `CreateUserRequest`

When you pass `CreateUserRequest` to `bindingCargo`, both the inherited `id` and the locally declared `role` are bound and validated together.

## Redeclaring an Inherited Field

Re-declaring an inherited field in a child class does **not** replace the parent's definition — the decorators from both classes are merged onto the same field. Re-applying a source decorator this way (for example `@Body()` on a field the parent already sources with `@Body()`) produces a schema error:

```
Update.id: @body + @body cannot be combined; pick a single source
```

So each field should be declared in a single class. To change how a field is bound or validated, edit it where it is originally declared rather than redeclaring it in a subclass.

## Notes

- Fields are collected across the entire prototype chain, so multiple levels of inheritance are supported.
