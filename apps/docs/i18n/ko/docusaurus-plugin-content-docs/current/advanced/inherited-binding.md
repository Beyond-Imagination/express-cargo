---
id: inherited-binding
title: 상속 바인딩
---

## 상속 바인딩 (inherited binding)

Field 데코레이터는 부모 클래스에서 선언된 필드도 함께 적용됩니다.  
즉, 공통 필드를 **기반 클래스**에 정의하고, 필요한 경우 **자식 클래스**에서 추가하거나 덮어쓸 수 있습니다.

### 예시 (Example)
```typescript
class BaseRequest {
  @body()
  @length(10)
  id!: string
}

class CreateUserRequest extends BaseRequest {
  @body()
  @oneOf(["admin", "user"])
  role!: string
}
```
### 결과
`CreateUserRequest`는 다음과 같은 필드를 가집니다:

- id : `BaseRequest`에서 상속됨

- role : `CreateUserRequest`에서 정의됨
