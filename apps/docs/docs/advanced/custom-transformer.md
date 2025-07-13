## custom transformer

You can transform stringified arrays, booleans, etc.

```typescript
class Requset {
    @query('tags')
    tags!: string[]; // Will cast from "tag1,tag2" to ['tag1', 'tag2']
}
```
