# Custom Transformer

The `@Transform` decorator lets you define custom transformation logic that runs **after** Express-Cargo's built-in type casting. This makes it ideal for advanced input normalization that goes beyond simple type conversion.

For basic `@Transform` usage, see the [Transformation Decorator](/docs/decorators/transforms) page.

## Execution Order

Understanding when `@Transform` runs is important:

1. The raw value is extracted from the request source (`@Query`, `@Body`, etc.)
2. **Built-in type casting** converts the value to the declared type (`String`, `Number`, `Boolean`, `Date`)
3. **`@Transform`** runs on the already-casted value
4. **Validation** is applied to the final result

This means your transformer function receives the type-casted value, not the raw string.

## Practical Recipes

### Comma-Separated String to Array

Query parameters are always strings. If your API accepts a comma-separated list (e.g., `?tags=a,b,c`), you can split it into an array:

```typescript
class SearchRequest {
    @Query()
    @Transform((value: string) => value.split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// Result: { tags: ['node', 'express', 'cargo'] }
```

### Boolean-Like String Casting

While Express-Cargo casts `"true"` to `true` automatically, you may need to handle other truthy values like `"yes"`, `"1"`, or `"on"`:

```typescript
class FilterRequest {
    @Query()
    @Transform((value: string) => ['true', 'yes', '1', 'on'].includes(String(value).toLowerCase()))
    active!: boolean
}

// GET /filter?active=yes → { active: true }
// GET /filter?active=0   → { active: false }
```

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
