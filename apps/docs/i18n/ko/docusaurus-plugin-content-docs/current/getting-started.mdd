## 🚀 Getting Started with express-cargo
이 문서는 **TypeScript + Express 환경에서 express-cargo를 빠르게 체험**하기 위한 최소 구성 가이드입니다.
예제는 **pnpm + Node.js 18 이상**을 기준으로 설명합니다.

---

### 1. 요구사항

- Node.js **18 이상 (LTS 권장)**

패키지 매니저: npm | yarn | pnpm
→ 본 문서에서는 pnpm 사용

>express-cargo는 Decorator + Metadata를 사용하므로 TypeScript 사용을 권장합니다.

---

### 2. Node.js 설치
아래 공식 사이트에서 OS에 맞는 LTS 버전을 설치합니다.

- Node.js 공식 다운로드
    https://nodejs.org


설치 확인:
```shell
node -v
pnpm -v
```
정상이라면 버전이 출력됩니다.

---

### 3. 새 프로젝트 생성 (pnpm)
#### pnpm
```shell
mkdir express-cargo-example
cd express-cargo-example
pnpm init
```

### 4. TypeScript 기본 환경 설정
#### 4-1. TypeScript 및 개발 의존성 설치
```shell
pnpm add -D typescript ts-node @types/node
```

#### 4-2. tsconfig.json 생성
```shell
pnpm tsc --init
```
#### 4-3. 권장 tsconfig 설정
```json
{
  "compilerOptions": {
    ...,
    "experimentalDecorators": true,     // express-cargo 필수
    "emitDecoratorMetadata": true,      // 타입 메타데이터 사용
    ...
  },
  ...
}
```

>⚠️ experimentalDecorators, emitDecoratorMetadata가 없으면
express-cargo의 validation / transform이 동작하지 않습니다.

---

### 5. express & express-cargo 설치
```shell
pnpm add express express-cargo
pnpm add -D @types/express
pnpm add reflect-metadata
```

---

### 6. 기본 서버 + express-cargo 설정
#### 6-1. `src/app.ts`

```typescript
import express from 'express'
import { bindingCargo, getCargo, Body, Query, Header, Params, Min, Max, Equal, NotEqual, Prefix, Suffix } from 'express-cargo'
import errorHandlerRouter from './errorHandler'

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(errorHandlerRouter)

app.listen(port, () => {console.log(`Example app listening on port ${port}`)})

class ExampleRequest {
  @Body() // 요청 body에서 필드 추출
  @Equal('1') // 값이 "1"이 아니면 validation error
  id!: string
}

app.post('/example', bindingCargo(ExampleRequest), (req, res) => { // bindingCargo(Class): 요청 → DTO 변환 + 검증
  const cargo = getCargo<ExampleRequest>(req) // 검증 완료된 타입 안전 객체 반환
  res.json(cargo)
})
```

### 7. 실행
```shell
npm run dev
```
요청 테스트:

```
POST http://localhost:3000/example
Content-Type: application/json

{
  "id": "1"
}

```

응답:

```
{ "id": "1" }
```

- ❌ `"id": "2"` → Validation Error 발생
