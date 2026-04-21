# Custom Transformer

The `@Transform` decorator lets you define custom transformation logic that runs **after** Express-Cargo's built-in type casting. It is designed to **refine values** — normalizing, clamping, or sanitizing a value whose type has already been settled — not to change the field's type.

For basic `@Transform` usage, see the [Transformation Decorator](/decorators/transforms) page.

:::note `@Transform` refines values, not types
Because built-in type casting (`String`, `Number`, `Boolean`, `Date`, `Array`) runs before the transformer, your function receives the already-casted value and should return the same type. If the raw request value doesn't match the declared type (for example, a comma-separated string arriving on a field declared as `string[]`), type casting will fail before your transformer ever runs.

When you need to produce a value of a different shape than the raw source — parsing a delimited string into an array, accepting multiple truthy spellings for a boolean, and so on — use the [`@Request`](/decorators/virtual) decorator instead. It bypasses built-in type casting entirely and hands you the `Request` object directly. See the [When to use `@Request` instead](#when-to-use-request-instead) section below.
:::

## Execution Order

Understanding when `@Transform` runs is important:

1. The raw value is extracted from the request source (`@Query`, `@Body`, etc.)
2. **Built-in type casting** converts the value to the declared type (`String`, `Number`, `Boolean`, `Date`)
3. **`@Transform`** runs on the already-casted value
4. **Validation** is applied to the final result

This means your transformer function receives the type-casted value, not the raw string.

## Practical Recipes

### Enum Normalization

Normalize user input to match your expected enum values:

```typescript
enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

class ListRequest {
    @Query()
    @Transform((value: string) => value.toLowerCase() as SortOrder)
    order!: SortOrder
}

// GET /list?order=DESC → { order: 'desc' }
```

### Sanitizing String Input

Remove unwanted characters or normalize whitespace:

```typescript
class CommentRequest {
    @Body()
    @Transform((value: string) => value.trim().replace(/\s+/g, ' '))
    content!: string
}

// POST { content: "  hello   world  " } → { content: "hello world" }
```

### Clamping Numeric Ranges

Ensure a number stays within an acceptable range:

```typescript
class PaginationRequest {
    @Query()
    @Transform((value: number) => Math.min(Math.max(value, 1), 100))
    limit!: number
}

// GET /items?limit=500 → { limit: 100 }
// GET /items?limit=-5  → { limit: 1 }
```

### Date Manipulation

Apply adjustments to parsed dates:

```typescript
class ReportRequest {
    @Query()
    @Transform((value: Date) => {
        // Set time to start of day (00:00:00)
        value.setHours(0, 0, 0, 0)
        return value
    })
    startDate!: Date
}
```

## Chaining with Other Decorators

`@Transform` works seamlessly alongside other Express-Cargo decorators:

```typescript
class ProductQuery {
    @Query('q')
    @Transform((value: string) => value.toLowerCase().trim())
    @IsNotEmpty()
    searchTerm!: string

    @Query()
    @Default(10)
    @Transform((value: number) => Math.min(value, 50))
    limit!: number
}
```

:::tip
Keep transformer functions simple and focused on a single responsibility. If you need complex multi-step transformations, consider composing utility functions:

```typescript
const normalize = (v: string) => v.trim().toLowerCase()
const clamp = (min: number, max: number) => (v: number) => Math.min(Math.max(v, min), max)

class Request {
    @Query()
    @Transform(normalize)
    keyword!: string

    @Query()
    @Transform(clamp(1, 100))
    page!: number
}
```
:::

## When to use `@Request` instead

When the request value needs to be reshaped into a different type — not just refined — `@Transform` is the wrong tool, because built-in type casting runs first and will either fail or coerce the value away from what you expected. Use [`@Request`](/decorators/virtual) to bypass type casting and work with the `Request` object directly.

### Comma-separated string to array

```typescript
class SearchRequest {
    @Request(req => String(req.query.tags ?? '').split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// Result: { tags: ['node', 'express', 'cargo'] }
```

### Flexible boolean parsing

Accept multiple truthy spellings such as `"yes"`, `"1"`, or `"on"` rather than only `"true"`:

```typescript
class FilterRequest {
    @Request(req => {
        const raw = String(req.query.active ?? '').toLowerCase()
        return ['true', 'yes', '1', 'on'].includes(raw)
    })
    active!: boolean
}

// GET /filter?active=yes → { active: true }
// GET /filter?active=0   → { active: false }
```