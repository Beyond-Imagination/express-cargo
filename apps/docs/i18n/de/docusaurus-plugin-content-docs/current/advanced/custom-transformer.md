## Benutzerdefinierter Transformer

Sie können stringifizierte Arrays, Booleans usw. transformieren.

```typescript
class Request {
    @Query('tags')
    tags!: string[]; // Wird von "tag1,tag2" in ['tag1', 'tag2'] umgewandelt
}
```
