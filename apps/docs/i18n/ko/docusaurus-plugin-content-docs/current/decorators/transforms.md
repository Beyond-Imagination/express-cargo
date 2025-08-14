---
id: transforms
title: 변환 데코레이터
---

# 변환 데코레이터 (Transformation Decorator)

Express-Cargo는 클래스에 데이터를 바인딩하기 전에 들어오는 요청 데이터를 자동으로 **변환(transform)**하기 위한 데코레이터를 제공합니다. 이 기능은 문자열을 숫자로, 문자열을 불리언으로 변환하거나 값을 정제하는 등의 작업에 유용합니다.

기존 필드를 조합하여 새로운 필드를 생성하는 가상 필드(virtual fields)와 달리, 이 변환 데코레이터는 단일 필드의 값을 직접 수정합니다.

## `@transform<T>(transformer: (value: any) => T)`

`@transform`은 데이터 변환을 위한 핵심 데코레이터입니다. 요청에서 가져온 원시(raw) 값을 받아 새로운 변환된 값을 반환하는 변환 함수를 사용합니다.

- `transformer`: 원시 값을 받아서 변환된 값을 반환하는 함수입니다.

## 사용 예시

이 예시는 `@transform` 데코레이터가 요청 데이터의 값을 정규화하거나 원하는 형태로 가공하는 방법을 보여줍니다. 이를 사용하면 사용자의 다양한 입력값(예: 대소문자, 쉼표로 구분된 목록)을 일관된 형식으로 처리할 수 있어 API의 안정성을 높이는 데 매우 유용합니다.

```typescript
import express, { Request, Response } from 'express'
import { bindingCargo, getCargo, query, transform } from 'express-cargo'

// 1. 데이터 가공 및 정규화 규칙이 포함된 클래스 정의
class SearchRequest {
    // 'sortBy' 쿼리 파라미터 값을 항상 소문자로 변환
    @query('sortBy')
    @transform((value: string) => value.toLowerCase())
    sortBy!: string

    // 'tags' 쿼리 파라미터 값을 쉼표로 분리하여 배열로 변환하고 각 요소의 공백 제거
    @query('tags')
    @transform((value: string) => value.split(',').map(tag => tag.trim()))
    tags!: string[]
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
        tagsType: typeof searchParams.tags,
        firstTag: searchParams.tags?.[0], // 배열 첫 번째 요소
    })
})

/*
이 엔드포인트를 테스트하려면, /search로 GET 요청을 보냅니다.

요청 URL 예시:
http://localhost:3000/search?page=10&isPublished=true
*/
```

## 출력 예시

예시 요청 URL로 접근하면, `bindingCargo` 미들웨어가 쿼리 파라미터를 처리합니다. `@transform` 데코레이터는 `sortBy` 값을 소문자 문자열로 정규화하고, 쉼표로 구분된 `tags` 문자열을 배열로 파싱합니다. `getCargo` 함수는 이렇게 변환된 값을 담고 있는 객체를 반환합니다.

```json
{
    "message": "Search parameters transformed successfully!",
    "data": {
        "sortBy": "title",
        "tags": [
            "typescript",
            "javascript",
            "node"
        ]
    },
    "sortByType": "string",
    "tagsType": "object",
    "firstTag": "typescript"
}
```
