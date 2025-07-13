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

