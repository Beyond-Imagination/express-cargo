## validator decorator

Built-in validators:

- @min(value: number)
- @max(value: number)
- @len(value: number)

```typescript
class Request {
    @min(18)
    @max(99)
    age!: number;

    @len(10)
    phone!: string;
}
```
