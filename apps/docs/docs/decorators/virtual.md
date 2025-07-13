```typescript
class Example {
    @virtual((req) => req.authHeader?.replace(/^Bearer /, ''))
    token!: string;
}
```

- Used for computed fields that depend on other fields.
