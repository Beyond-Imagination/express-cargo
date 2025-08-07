---
id: source-decorators
title: 소스 데코레이터
---

## 데코레이터 목록

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