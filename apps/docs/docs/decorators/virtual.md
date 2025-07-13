```typescript
class Request {
    @virtual((req) => req.headers.authorization?.replace(/^Bearer /, ''))
    token!: string;
}
```

- Used for computed fields that depend on other fields.
