---
id: inherited-binding
title: 상속 바인딩
---

## 상속 바인딩 (inherited binding)

### 동작 (Behavior)

- Field 데코레이터는 **프로토타입 체인**을 따라 상속됩니다.
- `getFieldList`는 현재 클래스와 부모 클래스의 메타데이터를 모두 수집합니다 (`Object.prototype` 제외).
- 동일한 이름의 필드는 자식 클래스가 부모의 정의를 **덮어씁니다**.
- `getFieldList`는 **source-decorators** 내부에서만 호출됩니다.  
  따라서 상속 기능을 올바르게 사용하려면 반드시 source-decorators와 함께 활성화해야 합니다.

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
CreateUserRequest의 필드 목록은 다음과 같습니다:

- id (부모 BaseRequest에서 상속됨)

- role (자식 CreateUserRequest에서 정의됨)