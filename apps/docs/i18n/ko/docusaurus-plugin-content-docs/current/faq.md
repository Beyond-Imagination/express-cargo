---
id: faq
title: 자주 묻는 질문
---

라이브러리 사용 중 궁금할 수 있는 내용들을 정리했습니다. 질문을 클릭하면 답변을 확인할 수 있습니다.

### 1. 시작하기

<details>
<summary><b>Q: express-cargo는 어떤 프로젝트인가요?</b></summary>

**A:** Express.js에서 반복적이고 번거로운 요청 데이터 처리(`req.body`, `req.query` 등)를 클래스 기반으로 자동화해주는 미들웨어입니다. TypeScript 데코레이터를 사용하여 데이터 바인딩과 유효성 검사를 한 곳에서 선언적으로 처리할 수 있습니다.
</details>

<details>
<summary><b>Q: 설치 시 주의사항이 있나요?</b></summary>

**A:** **Node.js 버전 20 이상**을 권장합니다. 기존 Express 프로젝트에 미들웨어 형태로 유연하게 통합될 수 있도록 설계되었습니다.
</details>

<details>
<summary><b>Q: TypeScript 설정이 꼭 필요한가요?</b></summary>

**A:** 네, 데코레이터를 사용하므로 `tsconfig.json`에서 아래 두 옵션이 반드시 `true`로 설정되어 있어야 합니다.
- `experimentalDecorators: true`
- `emitDecoratorMetadata: true`

또한, 런타임에서 타입 정보를 읽기 위해 `reflect-metadata` 패키지 설치가 필요합니다.
</details>

### 2. 데이터 바인딩 및 데코레이터

<details>
<summary><b>Q: `@Body`와 `@Query`의 차이점은 무엇인가요?</b></summary>

**A:** 데이터 추출 위치의 차이입니다.
- **`@Body`**: HTTP Request body에 담긴 데이터를 추출합니다. 주로 `POST`, `PUT` 요청 시 사용됩니다.
- **`@Query`**: URL의 쿼리 스트링(예: `?id=1&name=test`)에서 파라미터를 추출합니다. 주로 `GET` 요청 시 필터링이나 정렬 등에 사용됩니다.
- 그 외에도 `@Params()` (또는 `@Uri()`), `@Header()`, `@Session()` 등을 통해 다양한 데이터를 바인딩할 수 있습니다.
</details>

<details>
<summary><b>Q: @Uri()는 무엇인가요? @Params()와 다른가요?</b></summary>

**A:** `@Uri()`는 `@Params()`의 **별칭(Alias)**입니다. URL 경로 파라미터(예: `/:id`)를 바인딩할 때 가독성에 따라 선택해서 사용하시면 됩니다.
</details>

<details>
<summary><b>Q: 바인딩된 데이터는 어떻게 가져오나요?</b></summary>

**A:** 라우터에서 `bindingCargo(ClassName)` 미들웨어를 먼저 통과시킨 후, 핸들러 내부에서 `getCargo<ClassName>(req)` 함수를 호출하여 인스턴스를 가져올 수 있습니다.
</details>

### 3. 유효성 검사 및 변환

<details>
<summary><b>Q: 검증(Validation) 실패 시 어떻게 처리되나요?</b></summary>

**A:** 내부적으로 `@Min`, `@Max`, `@Length` 등의 데코레이터를 통해 검증이 수행됩니다. 유효하지 않은 데이터가 들어올 경우, 자동으로 에러 응답을 반환하거나 예외를 발생시킵니다.
</details>

<details>
<summary><b>Q: 필드 값을 가공해서 받고 싶을 땐 어떻게 하나요?</b></summary>

**A:** **`@Transform()`** 데코레이터를 사용하세요. 예를 들어 `@Transform(v => v.trim())`과 같이 작성하면 입력 데이터를 원하는 형태로 변환하여 바인딩할 수 있습니다.
</details>

<details>
<summary><b>Q: 특정 필드가 없을 수도 있는데, 에러를 피하려면?</b></summary>

**A:** **`@Optional()`** 데코레이터를 사용하세요. 해당 값이 `null`이거나 `undefined`여도 검증을 건너뛰고 정상적으로 바인딩됩니다.
</details>

### 4. 프레임워크 호환성

<details>
<summary><b>Q: Fastify나 NestJS에서도 사용할 수 있나요?</b></summary>

**A:** 본 라이브러리는 **Express.js 전용 미들웨어**로 설계되었습니다.
- **NestJS**: 자체적인 `ValidationPipe`를 가지고 있어 방식이 겹칠 수 있습니다. Express 어댑터 환경에서 사용은 가능하지만, 순수 Express 환경에서의 DX 향상이 주 목적입니다.
- **Fastify**: 현재 공식적으로 지원하지 않습니다.
</details>

### 5. 문제 해결

<details>
<summary><b>Q: 데이터가 클래스 인스턴스에 바인딩되지 않고 undefined가 나옵니다.</b></summary>

**A:** 두 가지를 확인해 보세요.
- `app.use(express.json())` 같은 본문 파싱 미들웨어가 `bindingCargo`보다 먼저 선언되었나요?
- `reflect-metadata`가 앱의 진입점(Entry point) 최상단에서 임포트 되었나요?
</details>

<details>
<summary><b>Q: 타입 변환이 자동으로 되나요?</b></summary>

**A:** 네, 클래스 필드에 정의된 타입(`string`, `number`, `boolean` 등)을 기반으로 적절하게 변환을 시도합니다. 예를 들어 `@Query()`로 들어온 문자열 `"123"`은 필드 타입이 `number`라면 숫자로 자동 변환됩니다.
</details>

### 6. 기타

<details>
<summary><b>Q: 상업적 프로젝트에서도 무료로 사용할 수 있나요?</b></summary>

**A:** 본 라이브러리는 **MIT 라이선스**를 따릅니다. 상업적 목적의 프로젝트에서도 자유롭게 사용, 수정 및 배포가 가능합니다.
</details>
