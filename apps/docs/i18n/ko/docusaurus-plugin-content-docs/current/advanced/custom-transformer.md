---
id: custom-transformer
title: 커스텀 변환기
---

## 커스텀 변환기 (Custom Transformer)

문자열로 전달된 배열, 불리언 등의 값을 변환할 수 있습니다.

```typescript
class Request {
    @Query('tags')
    tags!: string[]; // Will cast from "tag1,tag2" to ['tag1', 'tag2']
}
```
