---
id: custom-transformer
title: 커스텀 변환기
---

# 커스텀 변환기

`@Transform` 데코레이터를 사용하면 Express-Cargo의 내장 타입 캐스팅 **이후에** 실행되는 커스텀 변환 로직을 정의할 수 있습니다. 타입이 이미 확정된 값을 정규화·범위 제한·정리하는 등 **값을 다듬는 용도**로 설계되었으며, 필드의 타입을 바꾸는 용도는 아닙니다.

기본적인 `@Transform` 사용법은 [Transformation Decorator](/decorators/transforms) 페이지를 참고하세요.

:::note `@Transform`은 타입이 아닌 값을 다듬습니다
내장 타입 캐스팅(`String`, `Number`, `Boolean`, `Date`, `Array`)이 변환 함수보다 먼저 실행되기 때문에, 함수는 이미 캐스팅된 값을 받고 동일한 타입을 반환해야 합니다. 원본 요청 값이 선언된 타입과 맞지 않으면(예: `string[]`로 선언된 필드에 쉼표로 구분된 문자열이 들어오는 경우), 변환 함수가 실행되기도 전에 타입 캐스팅 단계에서 실패합니다.

원본과 다른 형태의 값을 만들어내야 하는 경우(구분자로 나뉜 문자열을 배열로 파싱, 여러 truthy 표현을 boolean으로 받기 등)에는 [`@Request`](/decorators/virtual) 데코레이터를 사용하세요. 내장 타입 캐스팅을 완전히 건너뛰고 `Request` 객체에 직접 접근할 수 있습니다. 아래 [`@Request`를 사용해야 하는 경우](#when-to-use-request-instead) 섹션을 참고하세요.
:::

## 실행 순서

`@Transform`이 실행되는 시점을 이해하는 것이 중요합니다:

1. 요청 소스(`@Query`, `@Body` 등)에서 원시 값을 추출
2. **내장 타입 캐스팅**이 선언된 타입(`String`, `Number`, `Boolean`, `Date`)으로 변환
3. **`@Transform`**이 타입 캐스팅된 값에 대해 실행
4. **검증(Validation)**이 최종 결과에 적용

즉, 변환 함수는 원시 문자열이 아닌 타입 캐스팅이 완료된 값을 받습니다.

## 실용 레시피

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

## `@Request`를 사용해야 하는 경우 {#when-to-use-request-instead}

요청 값을 단순히 다듬는 것이 아니라 **다른 타입으로 재구성**해야 하는 경우에는 `@Transform`이 적절하지 않습니다. 내장 타입 캐스팅이 먼저 실행되어 변환 함수에 도달하기 전에 실패하거나 예상과 다른 값으로 변형되기 때문입니다. 이런 경우 [`@Request`](/decorators/virtual)를 사용하여 타입 캐스팅을 우회하고 `Request` 객체를 직접 다루세요.

### 쉼표로 구분된 문자열을 배열로

```typescript
class SearchRequest {
    @Request(req => String(req.query.tags ?? '').split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// 결과: { tags: ['node', 'express', 'cargo'] }
```

### 유연한 boolean 파싱

`"true"`뿐 아니라 `"yes"`, `"1"`, `"on"` 같은 여러 truthy 표현을 허용합니다:

```typescript
class FilterRequest {
    @Request(req => {
        const raw = String(req.query.active ?? '').toLowerCase()
        return ['true', 'yes', '1', 'on'].includes(raw)
    })
    active!: boolean
}

// GET /filter?active=yes → { active: true }
// GET /filter?active=0   → { active: false }
```