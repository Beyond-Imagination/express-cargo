---
id: basic-usage
title: 기본 사용법
---

# 기본 사용법

이 예제는 **express-cargo**의 가장 단순한 엔드투엔드 흐름을 보여줍니다. 요청 클래스를 정의하고, `bindingCargo` 미들웨어로 바인딩한 뒤, `getCargo`로 검증된 결과를 읽습니다.

> 이 페이지는 바인딩 흐름에만 집중합니다. 프로젝트 설정(TypeScript, `tsconfig`, 의존성 설치)은 [시작하기](../getting-started.md)를 참고하세요.

## 1. 요청 클래스 정의

클래스를 선언하고 소스 데코레이터(여기서는 `@Body()`)를 사용해 각 필드를 들어오는 요청의 일부에 매핑합니다.

```typescript
// create-user.request.ts
import { Body } from 'express-cargo'

export class CreateUserRequest {
    @Body('name')
    name!: string

    @Body('email')
    email!: string
}
```

## 2. 미들웨어 적용

요청 클래스를 `bindingCargo`에 전달하고 라우트에 미들웨어로 등록합니다. 미들웨어는 핸들러가 실행되기 전에 요청을 바인딩하고 검증합니다.

```typescript
import express from 'express'
import { bindingCargo, getCargo } from 'express-cargo'
import { CreateUserRequest } from './create-user.request'

const app = express()
app.use(express.json())

app.post('/users', bindingCargo(CreateUserRequest), (req, res) => {
    // 3. 바인딩된 타입 안전 객체 읽기
    const user = getCargo<CreateUserRequest>(req)

    res.json({
        message: 'User created!',
        data: user,
    })
})
```

## 3. 요청 예시

```json
{
    "name": "Jane Doe",
    "email": "jane@example.com"
}
```

## 4. 결과 예시

`getCargo<CreateUserRequest>(req)`는 값이 완전히 채워진 `CreateUserRequest` 인스턴스를 반환합니다.

```json
{
    "message": "User created!",
    "data": {
        "name": "Jane Doe",
        "email": "jane@example.com"
    }
}
```

## 다음 단계

- 다른 소스에서 데이터 가져오기 (`@Query`, `@Header`, `@Params`) — [소스 데코레이터](../decorators/source-decorators.md) 참고
- `@Min`, `@Email` 같은 검증 규칙 추가 — [유효성 검사 데코레이터](../decorators/validators.md) 참고
- 중첩 객체 바인딩 — [중첩 요청 처리](./nested-request.md) 참고
- 검증 실패 처리 — [에러 처리](./validation-errors.md) 참고
