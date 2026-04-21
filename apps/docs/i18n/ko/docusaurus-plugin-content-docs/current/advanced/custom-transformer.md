---
id: custom-transformer
title: 커스텀 변환기
---

# 커스텀 변환기

`@Transform` 데코레이터를 사용하면 Express-Cargo의 내장 타입 캐스팅 **이후에** 실행되는 커스텀 변환 로직을 정의할 수 있습니다. 단순한 타입 변환을 넘어서는 고급 입력 정규화에 적합합니다.

기본적인 `@Transform` 사용법은 [Transformation Decorator](/decorators/transforms) 페이지를 참고하세요.

## 실행 순서

`@Transform`이 실행되는 시점을 이해하는 것이 중요합니다:

1. 요청 소스(`@Query`, `@Body` 등)에서 원시 값을 추출
2. **내장 타입 캐스팅**이 선언된 타입(`String`, `Number`, `Boolean`, `Date`)으로 변환
3. **`@Transform`**이 타입 캐스팅된 값에 대해 실행
4. **검증(Validation)**이 최종 결과에 적용

즉, 변환 함수는 원시 문자열이 아닌 타입 캐스팅이 완료된 값을 받습니다.

## 실용 레시피

### 쉼표로 구분된 문자열을 배열로 변환

쿼리 파라미터는 항상 문자열입니다. API가 쉼표로 구분된 목록(예: `?tags=a,b,c`)을 받는 경우, 배열로 분리할 수 있습니다:

```typescript
class SearchRequest {
    @Query()
    @Transform((value: string) => value.split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// 결과: { tags: ['node', 'express', 'cargo'] }
```

### Boolean 유사 문자열 캐스팅

Express-Cargo는 `"true"`를 `true`로 자동 캐스팅하지만, `"yes"`, `"1"`, `"on"` 같은 다른 truthy 값을 처리해야 할 수 있습니다:

```typescript
class FilterRequest {
    @Query()
    @Transform((value: string) => ['true', 'yes', '1', 'on'].includes(String(value).toLowerCase()))
    active!: boolean
}

// GET /filter?active=yes → { active: true }
// GET /filter?active=0   → { active: false }
```

### Enum 정규화

사용자 입력을 기대하는 enum 값에 맞게 정규화합니다:

```typescript
enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

class ListRequest {
    @Query()
    @Transform((value: string) => value.toLowerCase() as SortOrder)
    order!: SortOrder
}

// GET /list?order=DESC → { order: 'desc' }
```

### 문자열 입력 정리

불필요한 문자를 제거하거나 공백을 정규화합니다:

```typescript
class CommentRequest {
    @Body()
    @Transform((value: string) => value.trim().replace(/\s+/g, ' '))
    content!: string
}

// POST { content: "  hello   world  " } → { content: "hello world" }
```

### 숫자 범위 제한

숫자가 허용 범위 내에 있도록 보장합니다:

```typescript
class PaginationRequest {
    @Query()
    @Transform((value: number) => Math.min(Math.max(value, 1), 100))
    limit!: number
}

// GET /items?limit=500 → { limit: 100 }
// GET /items?limit=-5  → { limit: 1 }
```

### Date 조작

파싱된 날짜에 조정을 적용합니다:

```typescript
class ReportRequest {
    @Query()
    @Transform((value: Date) => {
        // 시간을 해당 일의 시작(00:00:00)으로 설정
        value.setHours(0, 0, 0, 0)
        return value
    })
    startDate!: Date
}
```

## 다른 데코레이터와 함께 사용

`@Transform`은 다른 Express-Cargo 데코레이터와 원활하게 함께 사용할 수 있습니다:

```typescript
class ProductQuery {
    @Query('q')
    @Transform((value: string) => value.toLowerCase().trim())
    @IsNotEmpty()
    searchTerm!: string

    @Query()
    @Default(10)
    @Transform((value: number) => Math.min(value, 50))
    limit!: number
}
```

:::tip
변환 함수는 단일 책임에 집중하여 간결하게 작성하세요. 복잡한 다단계 변환이 필요한 경우 유틸리티 함수를 조합하는 것을 고려하세요:

```typescript
const normalize = (v: string) => v.trim().toLowerCase()
const clamp = (min: number, max: number) => (v: number) => Math.min(Math.max(v, min), max)

class Request {
    @Query()
    @Transform(normalize)
    keyword!: string

    @Query()
    @Transform(clamp(1, 100))
    page!: number
}
```
:::