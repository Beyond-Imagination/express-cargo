---
id: overview
title: 개요
---

# 데코레이터 개요

## 데코레이터란 무엇인가요?
express-cargo의 데코레이터는 클래스 필드에 추가하여 미들웨어에게 다음과 같은 정보를 알려줍니다.

- 데이터를 어디에서 추출할지 (예: body, query 등)
- 어떻게 유효성 검사를 할지
- 어떻게 변환할지

클래스를 `bindingCargo`에 전달하면, 미들웨어는 이 데코레이터들을 읽어 `getCargo`로 가져올 수 있는 타입 안전한 객체를 생성·검증·변환합니다.

## 데코레이터 카테고리

데코레이터는 바인딩 파이프라인에서 맡는 역할에 따라 그룹으로 나뉩니다.

| 카테고리              | 목적                           | 예시                                                                                              | 참조                                                                   |
|-------------------|------------------------------|-------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| **Source**        | 필드 값을 어디에서 가져올지 선택           | `@Body`, `@Query`, `@Header`, `@Uri` / `@Params`, `@Session`, `@UploadedFile`, `@UploadedFiles` | [소스 데코레이터](./source-decorators.md), [파일 업로드 데코레이터](./file-upload.md) |
| **Request**       | Express `Request`에서 값을 직접 읽음 | `@Request`                                                                                      | [가상 필드 데코레이터](./virtual.md)                                          |
| **Virtual**       | 객체의 다른 필드로부터 필드를 계산          | `@Virtual`                                                                                      | [가상 필드 데코레이터](./virtual.md)                                          |
| **Transform**     | 바인딩 전에 단일 필드 값을 변경           | `@Transform`                                                                                    | [변환 데코레이터](./transforms.md)                                          |
| **Type helper**   | 원본 값을 어떻게 해석하고 변환할지 결정       | `@Type`, `@List`, `@Enum`                                                                       | [타입 헬퍼 데코레이터](./type-helpers.md)                                     |
| **Validation**    | 필드 값에 규칙을 적용                 | `@Min`, `@Max`, `@Email`, `@OneOf`, …                                                           | [유효성 검사 데코레이터](./validators.md)                                      |
| **Missing-value** | 필드가 없을 때의 동작을 결정             | `@Default`, `@Optional`                                                                         | [필드 누락 처리](./missing-fields.md)                                      |

**Source**, **Request**, **Virtual**은 "이 필드의 값이 어디에서 오는가"라는 같은 질문에 답합니다. 그래서 모든 필드는 이 중 정확히 하나만 가져야 하며, 서로 함께 쓸 수 없습니다. `@UploadedFile`과 `@UploadedFiles`는 multipart 파서의 결과를 읽는 소스 데코레이터입니다. 한 필드에 `@UploadedFile`과 `@Body`를 함께 쓰면 `@Body`와 `@Query`를 함께 쓴 것과 똑같이 거부됩니다.

`@Type`과 `@List`의 심화 시나리오(다형성, 순환 참조, 사용자 정의 클래스 배열)는 **고급 사용법**의 [타입 변환과 다형성](../advanced/type-and-polymorphism.md), [List 데코레이터](../advanced/list-decorator.md)를 참고하세요.

## 데코레이터 조합

하나의 필드는 여러 카테고리의 데코레이터를 함께 가질 수 있습니다. 이들은 함께 읽혀 해당 필드를 바인딩·변환·검증합니다.

```typescript
import { Body, Transform, MinLength } from 'express-cargo'

class CreateUserRequest {
    @Body('email')                              // Source: req.body.email에서 읽기
    @Transform((value: string) => value.trim()) // Transform: 값 정규화
    @MinLength(5)                               // Validation: 규칙 적용
    email!: string
}
```

제한은 카테고리 사이가 아니라 카테고리 안에서 걸립니다. 한 필드는 소스 하나, 타입 헬퍼 하나, 값 누락 처리 하나를 가지며, 검증 데코레이터는 자유롭게 겹쳐 쓸 수 있습니다. `bindingCargo()`는 라우트를 등록할 때 이 규칙들을 검사하고, 서버가 요청을 처리하기 전에 `CargoSchemaError`를 던집니다.

각 카테고리는 위에 링크된 개별 페이지에서 문서화되어 있습니다.
