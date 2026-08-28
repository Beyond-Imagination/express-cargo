---
id: type-helpers
title: 타입 헬퍼 데코레이터
---

# 타입 헬퍼 데코레이터

타입 헬퍼는 검증이 실행되기 전에 **필드 값을 어떻게 해석할지**를 바인더에게 알려줍니다. 중첩된 객체가 어떤 클래스가 될지, 배열의 각 요소가 어떤 타입으로 변환될지, 원본 문자열이 어떤 열거형 멤버에 대응될지를 결정합니다.

`@Type`, `@List`, `@Enum`은 하나의 카테고리를 이룹니다. 한 필드에는 이 중 최대 하나만 적용할 수 있습니다.

## `@Type(typeFn: TypeThunk | TypeResolver, options?: TypeOptions)`

평범한 JSON 객체를 대상 클래스의 인스턴스로 변환합니다.

- **`typeFn`**: 대상 클래스를 반환하는 함수. 고정된 타입에는 thunk `() => Class`를, 원본 데이터로 클래스를 고를 때는 리졸버 `(data) => Class`를 씁니다.
- **`options.discriminator`** (선택): `{ property, subTypes: [{ name, value }] }` 형태의 구조적 매핑. `property`의 값으로 클래스가 선택됩니다.

`@Type`은 `String`, `Number`, `Boolean` 필드에는 적용할 수 없습니다.

```typescript
class User {
    @Body()
    @Type(() => Profile)
    profile!: Profile
}
```

중첩 매핑, 순환 참조, 동적 해석은 [타입 변환과 다형성](../advanced/type-and-polymorphism.md)을 참고하세요.

## `@List(elementType: ArrayElementType)`

배열 필드의 요소 타입을 선언해 각 요소를 개별로 변환합니다.

- **`elementType`**: `String`, `Number`, `Boolean`, `Date`, 클래스 생성자, 또는 문자열 리터럴 `'string'`, `'number'`, `'boolean'`, `'date'` 중 하나.

`@List`는 배열 필드에만 적용할 수 있습니다.

```typescript
class ListSample {
    @Body()
    @List(Number)
    scores!: number[]
}
```

전체 예제는 [List 데코레이터](../advanced/list-decorator.md)를 참고하세요.

## `@Enum(enumObj: object, message?: string)`

들어온 값을 `enumObj`의 멤버로 매핑하고, 멤버가 아닌 값은 거부합니다.

- **`enumObj`**: 매핑 대상이 되는 열거형 객체.
- **`message`** (선택): 값이 멤버가 아닐 때 표시할 에러 메시지. 생략하면 기본 메시지가 사용됩니다.

열거형의 키(`'ADMIN'`)와 값(`'admin'`, `0`)을 모두 입력으로 받으며, 바인딩된 필드에는 항상 열거형 값이 들어갑니다. 숫자 문자열은 숫자로 비교하므로 `'0'`은 값이 `0`인 멤버에 매칭됩니다.

```typescript
enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

class UpdateRoleRequest {
    @Body('role')
    @Enum(UserRole)
    role!: UserRole
}
```

`@Enum`은 값을 변환하면서 검사도 하지만, [검증 데코레이터](./validators.md)가 아니라 **타입 헬퍼**입니다. 여기서 두 가지가 따라옵니다.

- `@Each`는 검증 데코레이터만 감쌀 수 있으므로 `@Each(Enum(UserRole))`은 거부됩니다.
- `@Enum`은 자체 트랜스포머를 설치하므로 `@Transform`과 함께 쓸 수 없습니다.

## 스키마 규칙

`bindingCargo()`는 아래 규칙들을 첫 요청 때가 아니라 라우트를 등록할 때 검사합니다. 위반이 있으면 기동 시점에 `CargoSchemaError`를 던집니다.

| 규칙                      | 위반 메시지                                                                         |
|-------------------------|--------------------------------------------------------------------------------|
| 한 필드에 타입 헬퍼는 하나만        | `@List + @Type cannot be combined; apply a single one of @Type/@List/@Enum`    |
| `@List`는 배열 필드가 필요      | `@List can only be applied to array fields`                                    |
| `@Type`은 원시 타입 필드를 거부   | `@Type cannot be applied to a primitive field`                                 |
| `@Each`는 타입 헬퍼를 감쌀 수 없음 | `@Each cannot wrap type-helper decorator(s): @Enum`                            |
| 트랜스포머는 `@Enum`의 것       | `@Enum cannot be combined with @Transform; @Enum installs its own transformer` |

메시지에는 실제로 적용한 데코레이터가 평가 순서(아래에서 위로)대로 나열되므로, 앞부분은 작성한 코드에 따라 달라집니다.
