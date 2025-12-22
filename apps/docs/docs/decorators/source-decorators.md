## Built-in decorators

| Decorator    | Source        |
|--------------|---------------|
| `@Body()`    | `req.body`    |
| `@Query()`   | `req.query`   |
| `@Header()`  | `req.headers` |
| `@Uri()`     | `req.params`  |
| `@Params()`  | `req.params`  |
| `@Session()` | `req.session` |

## Decorator Details

### `@Body()`

Extracts data from the HTTP request body and binds it to the corresponding field.

- source: `req.body`

---

### `@Query()`

Extracts data from the HTTP request query parameters and binds it to the corresponding field.

- source: `req.query`

---

### `@Header()`

Extracts values from the HTTP request headers and binds them to the corresponding field.  
It is commonly used to access request metadata such as authentication tokens (`Authorization`) or custom headers directly from a DTO.

- source: `req.headers`

---

### `@Uri()` / `@Params()`

Extracts path variables from the HTTP request URL and binds them to the corresponding field.  
This is typically used to receive resource identifiers (such as `id`) in REST APIs as part of a DTO.

Both decorators perform the same internal behavior, and `@Uri()` is an alias of `@Params()`.

- source: `req.params`
- Commonly used in routes such as `/users/:id`, `/posts/:postId`

---

### `@Session()`

Extracts values stored in the session and binds them to a DTO field.  
It is useful for passing server-side state, such as authenticated user information, into a DTO.

- source: `req.session`
- Only available when session middleware is configured

---

## Usage Example

Here is a example of how to use source decorators within an Express application.

```typescript
class Request {
    @Body('email')
    email!: string

    @Query('limit')
    limit!: number

    @Header('Authorization')
    authorization!: string
}
```