## custom transformer

You can transform stringified arrays, booleans, etc.

```typescript
class Request {
    @Query('tags')
    tags!: string[]; // Will cast from "tag1,tag2" to ['tag1', 'tag2']
}
```
