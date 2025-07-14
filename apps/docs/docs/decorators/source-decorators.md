## Built-in decorators

| Decorator    | Source        |
| ------------ | ------------- |
| `@body()`    | `req.body`    |
| `@query()`   | `req.query`   |
| `@header()`  | `req.headers` |
| `@uri()`     | `req.params`  |
| `@session()` | `req.session` |


```typescript
class Request {
    @body('email')
    email!: string

    @query('limit')
    limit!: number

    @header('Authorization')
    authorization!: string
}
```