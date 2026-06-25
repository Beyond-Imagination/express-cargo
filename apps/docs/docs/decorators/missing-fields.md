# Handling Missing Fields

When a field is **missing from the request** (its value is `undefined` or `null`), Express-Cargo needs to know what to do. Two decorators control this behavior:

- **`@Default(value)`** — substitute a fallback value.
- **`@Optional()`** — allow the field to stay empty without raising a "required" error.

Because both decide the same thing — what happens when a field is missing — they are **mutually exclusive**. Applying both to one field throws a schema error.

If a field has **neither** decorator and the value is missing, binding fails with a `<field> is required` validation error.

## `@Default(value: T)`

The `@Default` decorator assigns a default value to a class property when the request does not provide it.

- **`value`**: The default value to assign if the field is not present in the request.

```typescript
class Request {
    @Body()
    @Default(1)
    price!: number;
}
```

### When the Default Is Applied

The default value is applied **only when the incoming value is `undefined` or `null`** (i.e. the field is missing from the request). Any other value coming from the request is kept as-is.

This means falsy values such as `0`, `''`, and `false` are treated as real input and do **not** trigger the default:

```typescript
class Request {
    @Body()
    @Default(10)
    quantity!: number
}
```

| Incoming `quantity`   | Bound value            |
|-----------------------|------------------------|
| missing / `undefined` | `10` (default applied) |
| `null`                | `10` (default applied) |
| `0`                   | `0` (kept)             |
| `5`                   | `5` (kept)             |

## `@Optional()`

The `@Optional` decorator marks a field as optional, allowing it to be omitted or set to `undefined`/`null` without triggering a "required" error. When the field is missing, it is left as `null` and validation rules on the field are skipped.

```typescript
class Request {
    @Body()
    @Min(0)
    @Optional()
    discount?: number
}
```

Here a missing `discount` binds to `null` and the `@Min(0)` rule is skipped. If `discount` **is** provided, it is validated normally.

## Choosing Between `@Default` and `@Optional`

| | Field missing | Field provided |
|---|---|---|
| `@Default(value)` | bound to `value` | value kept and validated |
| `@Optional()` | bound to `null` | value kept and validated |
| neither | `<field> is required` error | value kept and validated |

Pick **one** strategy per field:

```typescript
class Request {
    // ❌ Invalid: a field can use only one missing-value strategy
    @Body()
    @Default(1)
    @Optional()
    price!: number
}
```
