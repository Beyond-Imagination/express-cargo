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

| 카테고리 | 목적 | 예시 | 참조 |
|----------|------|------|------|
| **Source** | 필드 값을 어디에서 가져올지 선택 | `@Body`, `@Query`, `@Header`, `@Uri` / `@Params`, `@Session` | [소스 데코레이터](./source-decorators.md) |
| **File** | `multipart/form-data` 요청의 업로드 파일을 바인딩 | `@UploadedFile`, `@UploadedFiles` | [파일 업로드 데코레이터](./file-upload.md) |
| **Virtual** | 다른 필드나 원본 `Request`에서 필드를 계산 | `@Virtual`, `@Request` | [가상 필드 데코레이터](./virtual.md) |
| **Transform** | 바인딩 전에 단일 필드 값을 변경 | `@Transform` | [변환 데코레이터](./transforms.md) |
| **Validation** | 필드 값에 규칙을 적용 | `@Min`, `@Max`, `@Email`, `@OneOf`, … | [유효성 검사 데코레이터](./validators.md) |
| **Missing-value** | 필드가 없을 때의 동작을 결정 | `@Default`, `@Optional` | [필드 누락 처리](./missing-fields.md) |

그 외 헬퍼는 **고급 사용법**에서 다룹니다. 예를 들어 타입 배열용 [`@List`](../advanced/list-decorator.md), 중첩·다형성 타입용 [`@Type`](../advanced/type-and-polymorphism.md) 등이 있습니다.

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

각 카테고리는 위에 링크된 개별 페이지에서 문서화되어 있습니다.
