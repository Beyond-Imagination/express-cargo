## 가상필드

```typescript
class Request {
    @virtual((req) => req.headers.authorization?.replace(/^Bearer /, ''))
    token!: string;
}
```

- 다른 필드 또는 요청 속성에 따라 필드 값을 계산합니다
