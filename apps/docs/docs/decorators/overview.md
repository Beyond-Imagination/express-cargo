# Decorators Overview

## What are decorators?
Decorators in express-cargo annotate class fields to tell the middleware:

- Where to extract data from (e.g., body, query)
- How to validate it
- How to transform it

When you pass a class to `bindingCargo`, the middleware reads these decorators to build, validate, and transform a type-safe object that you retrieve with `getCargo`.

## Decorator Categories

Decorators are grouped by the role they play in the binding pipeline.

| Category          | Purpose                                             | Examples                                                                                        | Reference                                                                               |
|-------------------|-----------------------------------------------------|-------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| **Source**        | Choose where a field's value comes from             | `@Body`, `@Query`, `@Header`, `@Uri` / `@Params`, `@Session`, `@UploadedFile`, `@UploadedFiles` | [Source Decorators](./source-decorators.md), [File Upload Decorators](./file-upload.md) |
| **Request**       | Read a value straight from the Express `Request`    | `@Request`                                                                                      | [Virtual Field Decorators](./virtual.md)                                                |
| **Virtual**       | Compute a field from the other fields of the object | `@Virtual`                                                                                      | [Virtual Field Decorators](./virtual.md)                                                |
| **Transform**     | Modify a single field's value before binding        | `@Transform`                                                                                    | [Transformation Decorator](./transforms.md)                                             |
| **Type helper**   | Decide how a raw value is interpreted and cast      | `@Type`, `@List`, `@Enum`                                                                       | [Type Helper Decorators](./type-helpers.md)                                             |
| **Validation**    | Enforce rules on a field's value                    | `@Min`, `@Max`, `@Email`, `@OneOf`, …                                                           | [Validation Decorators](./validators.md)                                                |
| **Missing-value** | Decide what happens when a field is absent          | `@Default`, `@Optional`                                                                         | [Handling Missing Fields](./missing-fields.md)                                          |

**Source**, **Request**, and **Virtual** answer the same question — where does this field come from? — so every field must carry exactly one of them, and they cannot be mixed. `@UploadedFile` and `@UploadedFiles` are source decorators that read the multipart parser's output, which is why `@UploadedFile` and `@Body` on one field are rejected the same way `@Body` and `@Query` are.

For the deeper `@Type` and `@List` scenarios — polymorphism, circular references, arrays of custom classes — see [Type Transformation & Polymorphism](../advanced/type-and-polymorphism.md) and [List Decorator](../advanced/list-decorator.md) under **Advanced Usage**.

## Stacking Decorators

A single field can carry decorators from multiple categories. They are read together to bind, transform, and validate that field:

```typescript
import { Body, Transform, MinLength } from 'express-cargo'

class CreateUserRequest {
    @Body('email')                              // Source: read from req.body.email
    @Transform((value: string) => value.trim()) // Transform: normalize the value
    @MinLength(5)                               // Validation: enforce a rule
    email!: string
}
```

Stacking is limited within a category rather than across categories: a field takes one source, one type helper, and one missing-value strategy, while validation decorators can be stacked freely. `bindingCargo()` checks these rules when the route is registered and throws `CargoSchemaError` before the server handles a request.

Each category is documented in its own page linked above.
