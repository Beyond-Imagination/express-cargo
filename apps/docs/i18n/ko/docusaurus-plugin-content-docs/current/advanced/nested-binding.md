---
id: nested-binding
title: 중첩 바인딩
---

## nested binding

```typescript
class Profile {
    @body('nickname')
    nickname!: string;
}

class Request {
    @body('profile')
    profile!: Profile;
}
```

- Nested objects are fully supported with recursive type casting and validation.

