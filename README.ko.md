# express-cargo

**express-cargo**는 Express.js에서 request 데이터를 더욱 쉽고 타입 안전하게 관리할 수 있도록 도와주는 미들웨어 라이브러리입니다.  
클래스 기반의 데코레이터와 바인딩 기능을 제공하여, 복잡한 request 파싱과 검증을 간결하게 처리할 수 있습니다.

---

## 주요 특징

- **클래스 기반 request 파싱**: 데코레이터로 body, query, param 등 request 데이터를 자동으로 바인딩
- **타입 안전성**: TypeScript와 완벽하게 호환
- **간편한 미들웨어 적용**: 기존 Express 미들웨어와 쉽게 통합

---

## 디렉토리 구조

```
/
├── apps/
│   ├── docs/         # docusaurus 로 작성한 문서
│   └── example/      # express-cargo 사용 예제 앱
└── packages/
    └── express-cargo/ # express-cargo 라이브러리 소스
```

---

## 설치

```bash
npm install express-cargo
```

---

## 빠른 시작

```ts
import express from 'express'
import { body, bindingCargo, getCargo } from 'express-cargo'

const app = express()
app.use(express.json())

class BodyExample {
  @body() number1!: number
  @body() number2!: number
}

app.post('/sum', bindingCargo(BodyExample), (req, res) => {
  const data = getCargo<BodyExample>(req)
  res.json({ sum: data.number1 + data.number2 })
})

app.listen(3000)
```

---

## 예제 및 문서

- **apps/example**: 다양한 실전 예제 코드 제공
- **apps/docs**: 공식 문서 및 API 가이드

---

## 개발 및 빌드

```bash
pnpm install
pnpm build
```

---

## 기여하기

1. 이 저장소를 fork 후 브랜치 생성
2. 변경사항 커밋 및 PR 생성
3. 코드 스타일은 Prettier, ESLint 규칙을 따라주세요

---

## 라이선스

MIT
