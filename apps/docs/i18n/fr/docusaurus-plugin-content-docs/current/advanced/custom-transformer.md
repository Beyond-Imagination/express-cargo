## Transformateur personnalisé

Vous pouvez transformer des tableaux sous forme de chaîne, des booléens, etc.

```typescript
class Request {
    @Query('tags')
    tags!: string[]; // Sera converti de "tag1,tag2" en ['tag1', 'tag2']
}
```
