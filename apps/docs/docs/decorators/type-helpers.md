# Type Helper Decorators

Type helpers tell the binder **how to interpret a field's value** before validation runs. They decide which class a nested object becomes, which type each array element is cast to, and which enum member a raw string maps to.

`@Type`, `@List`, and `@Enum` form a single category. At most one of them may be applied to a field.

## `@Type(typeFn: TypeThunk | TypeResolver, options?: TypeOptions)`

Converts a plain JSON object into an instance of the target class.

- **`typeFn`**: A function returning the target class. Use a thunk `() => Class` for a fixed type, or a resolver `(data) => Class` to pick the class from the raw data.
- **`options.discriminator`** (optional): Structural mapping in the form `{ property, subTypes: [{ name, value }] }`. The class is selected by the value of `property`.

`@Type` cannot be applied to a `String`, `Number`, or `Boolean` field.

```typescript
class User {
    @Body()
    @Type(() => Profile)
    profile!: Profile
}
```

See [Type Transformation & Polymorphism](../advanced/type-and-polymorphism.md) for nested mapping, circular references, and dynamic resolution.

## `@List(elementType: ArrayElementType)`

Declares the element type of an array field so that every element is cast individually.

- **`elementType`**: `String`, `Number`, `Boolean`, `Date`, a class constructor, or one of the string literals `'string'`, `'number'`, `'boolean'`, `'date'`.

`@List` can only be applied to array fields.

```typescript
class ListSample {
    @Body()
    @List(Number)
    scores!: number[]
}
```

See [List Decorator](../advanced/list-decorator.md) for a full example.

## `@Enum(enumObj: object, message?: string)`

Maps the incoming value onto a member of `enumObj`, and rejects a value that is not a member.

- **`enumObj`**: The enum object to map against.
- **`message`** (optional): The error message to display when the value is not a member. If omitted, a default message will be used.

Both the enum key (`'ADMIN'`) and the enum value (`'admin'`, `0`) are accepted as input, and the bound field always holds the enum value. A numeric string is compared numerically, so `'0'` matches the member whose value is `0`.

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

`@Enum` both casts and checks the value, but it is a **type helper**, not a [validation decorator](./validators.md). Two consequences follow:

- `@Each` wraps validation decorators only, so `@Each(Enum(UserRole))` is rejected.
- `@Enum` installs its own transformer, so it cannot be combined with `@Transform`.

## Schema Rules

`bindingCargo()` checks the rules below when the route is registered, not on the first request. A violation throws `CargoSchemaError` at startup.

| Rule                              | Violation message                                                              |
|-----------------------------------|--------------------------------------------------------------------------------|
| Only one type helper per field    | `@List + @Type cannot be combined; apply a single one of @Type/@List/@Enum`    |
| `@List` requires an array field   | `@List can only be applied to array fields`                                    |
| `@Type` rejects a primitive field | `@Type cannot be applied to a primitive field`                                 |
| `@Each` cannot wrap a type helper | `@Each cannot wrap type-helper decorator(s): @Enum`                            |
| `@Enum` owns the transformer      | `@Enum cannot be combined with @Transform; @Enum installs its own transformer` |

A message names the decorators you actually applied, listed in decorator evaluation order (bottom-up), so the leading part varies with your code.
