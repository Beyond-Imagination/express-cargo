---
id: nested-binding
title: 중첩 바인딩
---

# 중첩 DTO 바인딩

Express-Cargo를 사용하면 요청 내 중첩 객체를 처리할 수 있으며, 중첩 DTO로 자동 바인딩되면서 재귀적인 타입 캐스팅과 검증을 지원합니다.

## 사용 예시

```typescript
import express, { Request, Response } from 'express'
import { body, bindingCargo, getCargo } from 'express-cargo'

// 1. 중첩 DTO 정의
class Profile {
    @body('nickname')
    nickname!: string
}

class RequestDto {
    @body('profile')
    profile!: Profile
}

// 2. Express 앱과 라우트 설정
const app = express()
app.use(express.json())

app.post('/submit', bindingCargo(RequestDto), (req: Request, res: Response) => {
    const requestData = getCargo<RequestDto>(req)

    res.json({
        message: '중첩 DTO가 성공적으로 바인딩되었습니다!',
        data: requestData,
    })
})

/*
이 엔드포인트를 테스트하려면 /submit에 POST 요청을 보내세요.

예시 요청 URL:
http://localhost:3000/submit
*/
```

## 출력 예시

중첩된 profile 객체가 포함된 POST 요청이 전송되면, `bindingCargo` 미들웨어가 중첩 `Profile` DTO를 자동으로 인스턴스화하고 검증합니다. 이후 `getCargo` 함수는 중첩 데이터가 모두 채워진 객체를 반환합니다.

```json
{
    "message": "중첩 DTO가 성공적으로 바인딩되었습니다!",
    "data": {
        "profile": {
            "nickname": "coder123"
        }
    }
}
```
