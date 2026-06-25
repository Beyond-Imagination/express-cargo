## 内置装饰器

| 装饰器       | 来源          |
|--------------|---------------|
| `@Body()`    | `req.body`    |
| `@Query()`   | `req.query`   |
| `@Header()`  | `req.headers` |
| `@Uri()`     | `req.params`  |
| `@Params()`  | `req.params`  |
| `@Session()` | `req.session` |

## 装饰器详情

### `@Body()`

从 HTTP 请求 body 中提取数据，并绑定到对应字段。

- 来源：`req.body`

---

### `@Query()`

从 HTTP 请求的 query 参数中提取数据，并绑定到对应字段。

- 来源：`req.query`

---

### `@Header()`

从 HTTP 请求头中提取值，并绑定到对应字段。  
它常用于直接从 DTO 访问请求元数据，例如认证令牌（`Authorization`）或自定义请求头。

- 来源：`req.headers`

---

### `@Uri()` / `@Params()`

从 HTTP 请求 URL 中提取路径变量，并绑定到对应字段。  
这通常用于在 REST API 中把资源标识符（例如 `id`）作为 DTO 的一部分接收。

两个装饰器的内部行为完全相同，`@Uri()` 是 `@Params()` 的别名。

- 来源：`req.params`
- 常用于 `/users/:id`、`/posts/:postId` 等路由

---

### `@Session()`

从 session 中提取已存储的值，并绑定到 DTO 字段。  
它适合将认证用户信息等服务端状态传入 DTO。

- 来源：`req.session`
- 仅在已配置 session 中间件时可用

---

## 使用示例

下面是在 Express 应用中使用来源装饰器的示例。

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
