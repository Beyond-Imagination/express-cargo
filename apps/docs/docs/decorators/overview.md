# Decorators Overview

## What are decorators?
Decorators in express-cargo annotate class fields to tell the middleware:

- Where to extract data from (e.g., body, query)
- How to validate it
- How to transform it

When you pass a class to `bindingCargo`, the middleware reads these decorators to build, validate, and transform a type-safe object that you retrieve with `getCargo`.

## Decorator Categories

Decorators are grouped by the role they play in the binding pipeline.

| Category          | Purpose                                                     | Examples                                                     | Reference                                         |
|-------------------|-------------------------------------------------------------|--------------------------------------------------------------|---------------------------------------------------|
| **Source**        | Choose where a field's value comes from                     | `@Body`, `@Query`, `@Header`, `@Uri` / `@Params`, `@Session` | [Source Decorators](./source-decorators.md)       |
| **Virtual**       | Compute a field from other fields or from the raw `Request` | `@Virtual`, `@Request`                                       | [Virtual Field Decorators](./virtual.md)          |
| **Transform**     | Modify a single field's value before binding                | `@Transform`                                                 | [Transformation Decorator](./transforms.md)       |
| **Validation**    | Enforce rules on a field's value                            | `@Min`, `@Max`, `@Email`, `@OneOf`, …                        | [Validation Decorators](./validators.md)          |
| **Missing-value** | Decide what happens when a field is absent                  | `@Default`, `@Optional`                                      | [Handling Missing Fields](./missing-fields.md) |

Additional helpers are covered under **Advanced Usage**, such as [`@List`](../advanced/list-decorator.md) for typed arrays, and [`@Type`](../advanced/type-and-polymorphism.md) for nested and polymorphic types.

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

Each category is documented in its own page linked above.
