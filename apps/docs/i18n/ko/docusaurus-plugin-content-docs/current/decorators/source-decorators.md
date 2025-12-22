---
id: source-decorators
title: 소스 데코레이터
---

## 데코레이터 목록

| Decorator    | Source        |
|--------------|---------------|
| `@Body()`    | `req.body`    |
| `@Query()`   | `req.query`   |
| `@Header()`  | `req.headers` |
| `@Uri()`     | `req.params`  |
| `@Params()`  | `req.params`  |
| `@Session()` | `req.session` |

## 데코레이터 상세

### `@Body()`

HTTP 요청의 body에 포함된 데이터를 추출하여 해당 필드에 바인딩합니다.

- source: `req.body`

---

### `@Query()`

HTTP 요청의 query parameter에 포함된 데이터를 추출하여 해당 필드에 바인딩합니다.

- source: `req.query`

---

### `@Header()`

HTTP 요청의 header에 포함된 값을 추출하여 해당 필드에 바인딩합니다.
주로 인증 토큰(`Authorization`), 커스텀 헤더 등 요청 메타데이터를 DTO에서 직접 사용할 때 사용됩니다.

- source: `req.headers`

---

### `@Uri()` / `@Params()`

HTTP 요청 URL 경로에 포함된 경로 변수(path variable)를 추출하여 해당 필드에 바인딩합니다.
REST API에서 리소스 식별자(id 등)를 명시적으로 DTO로 받고 싶을 때 사용합니다.

두 데코레이터는 내부적으로 동일한 동작을 수행하며,
`@Uri()`는 `@Params()`의 alias입니다.

- source: `req.params`
- 주로 `/users/:id`, `/posts/:postId` 같은 경로에서 사용됩니다.

---

### `@Session()`

세션에 저장된 값을 추출하여 DTO의 필드에 바인딩합니다.
로그인 사용자 정보 등 서버 측에서 유지하는 상태 데이터를 DTO로 전달할 때 사용합니다.

- source: `req.session`
- 세션 미들웨어가 설정된 환경에서만 유효합니다.

---

## 사용 예시

아래는 Express 애플리케이션에서 소스 데코레이터를 사용하는 예제입니다.

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