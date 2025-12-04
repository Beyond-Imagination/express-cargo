---
id: transforms
title: 변환 데코레이터
---

# 변환 데코레이터 (Transformation Decorator)

Express-Cargo는 들어오는 요청 데이터를 클래스에 바인딩하기 전에 자동으로 **가공(transform)**하기 위한 데코레이터를 제공합니다. 이 기능은 사용자 입력값을 정규화하거나(예: 문자열을 소문자로 변환), 쉼표로 구분된 문자열을 배열로 파싱하는 등의 작업에 유용합니다.

기존 필드를 조합하여 새로운 필드를 생성하는 가상 필드(virtual fields)와 달리, 이 변환 데코레이터는 단일 필드의 값을 직접 수정합니다.

## `@Transform<T>(transformer: (value: T) => T)`

`@Transform`은 데이터 변환을 위한 핵심 데코레이터입니다. 요청에서 가져온 원시(raw) 값을 받아 새로운 변환된 값을 반환하는 변환 함수를 사용합니다.

- `transformer`: 원시 값을 받아서 변환된 값을 반환하는 함수입니다.

## 사용 예시

이 예시는 `@Transform` 데코레이터가 요청 데이터의 값을 정규화하거나 원하는 형태로 가공하는 방법을 보여줍니다. 이를 사용하면 사용자의 다양한 입력값을 일관된 형식으로 처리할 수 있어 API의 안정성을 높이는 데 매우 유용합니다.

```typescript
import express, { Request, Response } from 'express'
import { bindingCargo, getCargo, Query, Transform } from 'express-cargo'

// 1. 데이터 가공 및 정규화 규칙이 포함된 클래스 정의
class SearchRequest {
    // 'sortBy' 쿼리 파라미터 값을 항상 소문자로 변환
    @Query('sortBy')
    @Transform((value: string) => value.toLowerCase())
    sortBy!: string

    // 'count' 쿼리 파라미터 값을 2배로 변환
    @Query()
    @Transform((value: number) => value * 2)
    count!: number
}

const app = express()
app.use(express.json())

// 2. bindingCargo 미들웨어 적용
app.get('/search', bindingCargo(SearchRequest), (req: Request, res: Response) => {
    // 3. 변환된 데이터를 올바른 타입으로 접근
    const searchParams = getCargo<SearchRequest>(req)

    res.json({
        message: 'Search parameters transformed successfully!',
        data: searchParams,
        // 변환된 데이터와 그 타입 확인
        sortByType: typeof searchParams.sortBy,
        countType: typeof searchParams.count,
        doubleCount: searchParams.count,
    })
})

/*
이 엔드포인트를 테스트하려면, /search로 GET 요청을 보냅니다.

요청 URL 예시:
http://localhost:3000/search?page=10&isPublished=true
*/
```

## 출력 예시

예시 요청 URL로 접근하면, `bindingCargo` 미들웨어가 쿼리 파라미터를 처리합니다. `@transform` 데코레이터는 `sortBy` 값을 소문자 문자열로 정규화하고, `count` 값을 2배로 변환합니다. `getCargo` 함수는 이렇게 변환된 값을 담고 있는 객체를 반환합니다.

```json
{
    "message": "Search parameters transformed successfully!",
    "data": {
        "sortBy": "title",
        "count": 10
    },
    "sortByType": "string",
    "countType": "number",
    "doubleCount": 10
}
```
