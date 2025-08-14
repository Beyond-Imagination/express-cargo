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

`@transform` 데코레이터를 사용하여 데이터 유형을 처리하는 전체 예시입니다. 이 기능은 특히 항상 문자열로 파싱되는 쿼리 파라미터나 폼 바디의 데이터를 처리할 때 유용합니다.

```typescript
import express, { Request, Response } from 'express'
import { bindingCargo, getCargo, body, query, transform } from 'express-cargo'

// 1. 소스 및 변환 규칙이 있는 클래스 정의
class SearchRequest {
    // 'page' 쿼리 파라미터(문자열)를 숫자로 변환합니다.
    @query('page')
    @transform((value: string) => parseInt(value, 10))
    page!: number

    // 'isPublished' 쿼리 파라미터(문자열)를 불리언으로 변환합니다.
    @query('isPublished')
    @transform((value: string) => value === 'true')
    isPublished!: boolean
}

const app = express()
app.use(express.json())

// 2. 라우트에 bindingCargo 미들웨어 적용
app.get('/search', bindingCargo(SearchRequest), (req: Request, res: Response) => {
    // 3. 이제 올바른 타입을 가진 데이터에 접근합니다.
    const searchParams = getCargo<SearchRequest>(req)

    res.json({
        message: '검색 파라미터가 성공적으로 처리되었습니다!',
        data: searchParams,
        // 데이터 타입이 올바르게 변환되었습니다.
        pageType: typeof searchParams.page, 
        isPublishedType: typeof searchParams.isPublished
    })
})

/*
이 엔드포인트를 테스트하려면, /search로 GET 요청을 보냅니다.

요청 URL 예시:
http://localhost:3000/search?page=10&isPublished=true
*/
```

## 출력 예시

예시 요청 URL에 접근하면, `bindingCargo` 미들웨어는 문자열 값인 `page='10'`과 `isPublished='true'`를 올바른 데이터 타입으로 변환합니다. `getCargo` 함수는 이 변환된 값을 포함하는 객체를 반환합니다.

```json
{
    "message": "검색 파라미터가 성공적으로 처리되었습니다!",
    "data": {
        "page": 10,
        "isPublished": true
    },
    "pageType": "number",
    "isPublishedType": "boolean"
}
```
