## カスタムトランスフォーマー

文字列化された配列やブール値などを変換できます。

```typescript
class Request {
    @Query('tags')
    tags!: string[]; // "tag1,tag2" を ['tag1', 'tag2'] にキャスト
}
```