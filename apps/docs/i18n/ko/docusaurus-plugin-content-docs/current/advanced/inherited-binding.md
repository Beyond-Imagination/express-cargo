---
id: inherited-binding
title: 상속 바인딩
---

# 상속 바인딩

필드 데코레이터는 부모 클래스에서 선언된 필드에도 함께 적용됩니다.  
즉, 공통 필드를 **기반 클래스**에 한 번 정의하고 **자식 클래스** 전반에서 재사용할 수 있습니다.

## 예시
```typescript
class BaseRequest {
  @Body()
  @Length(10)
  id!: string
}

class CreateUserRequest extends BaseRequest {
  @Body()
  @OneOf(["admin", "user"])
  role!: string
}
```

## 결과
`CreateUserRequest`는 다음과 같은 필드를 가집니다.

- id : `BaseRequest`에서 상속됨

- role : `CreateUserRequest`에서 정의됨

`CreateUserRequest`를 `bindingCargo`에 전달하면, 상속된 `id`와 로컬에서 선언한 `role`이 함께 바인딩되고 검증됩니다.

## 상속된 필드 재선언

자식 클래스에서 상속된 필드를 다시 선언해도 부모 클래스의 정의가 대체되지 **않습니다**. 두 클래스의 데코레이터가 같은 필드에 병합됩니다. 이런 식으로 소스 데코레이터를 다시 적용하면(예: 부모 클래스가 이미 `@Body()`로 가져오는 필드에 `@Body()`를 추가하면) 스키마 오류가 발생합니다.

```
Update.id: @Body + @Body cannot be combined; pick a single source
```

따라서 각 필드는 하나의 클래스에서만 선언해야 합니다. 필드의 바인딩 방식이나 검증 방식을 바꾸려면, 자식 클래스에서 재선언하지 말고 원래 선언된 곳에서 수정하세요.

## 참고

- 필드는 전체 프로토타입 체인에 걸쳐 수집되므로 여러 단계의 상속을 지원합니다.
