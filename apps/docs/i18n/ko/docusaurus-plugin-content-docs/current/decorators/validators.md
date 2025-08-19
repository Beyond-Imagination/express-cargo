---
id: validators
title: 유효성 검사 데코레이터
---

# 유효성 검사 데코레이터 (Validation Decorators)

**Express-Cargo**는 요청 데이터가 클래스에 바인딩될 때 데코레이터를 사용하여 해당 데이터를 검증합니다.

유효성 검사는 독립적인 `validate` 함수에 의해 수행되지 않습니다. 대신, `bindingCargo` 미들웨어에 통합되어 있어 요청 처리 과정에서 자동으로 유효성 검사를 수행합니다.

---

## 기본 제공 유효성 검사기 (Built-in Validators)

### `@min(value: number)`

숫자가 지정된 최소값 이상인지 확인합니다.

* **`value`**: 허용되는 최소값

---

### `@max(value: number)`

숫자가 지정된 최대값 이하인지 확인합니다.

* **`value`**: 허용되는 최대값

---

### `@prefix(value: string)`

문자열이 지정된 접두사로 시작하는지 확인합니다.

* **`value`**: 요구되는 시작 텍스트

---

### `@suffix(value: string)`

문자열이 지정된 접미사로 끝나는지 확인합니다.

* **`value`**: 요구되는 종료 텍스트

---

### `@equal(value: any)`

입력 값이 주어진 값과 **엄격하게 동일함** (`===`)을 확인합니다.

* **`value`**: 비교할 대상 값

---

### `@notEqual(value: any)`

입력 값이 주어진 값과 **엄격하게 동일하지 않음** (`!==`)을 확인합니다.

* **`value`**: 비교할 대상 값

---

### `@isFalse()`

주어진 값이 `false` 인지 확인합니다.

---

### `@length(value: number)`

문자열의 길이가 지정된 값과 정확히 일치하는지 확인합니다.

- **`value`**: 문자열 길이

### `@validate(validateFn: (value: unknown) => boolean, message?: string)`

데코레이터가 적용된 필드에 사용자 정의 검증 함수를 적용합니다.
이 데코레이터를 사용하면 기본 제공 데코레이터를 넘어서는 유연한 검증 로직을 구현할 수 있습니다.

- **`validateFn`**: 필드 값을 받아서 유효하면 true, 그렇지 않으면 false를 반환하는 함수
- **`message`** (선택 사항): 검증 실패 시 표시할 메시지. 생략하면 기본 메시지가 사용됩니다.


### `@regexp(pattern: RegExp, message?: string)`

데코레이터가 적용된 필드 값이 지정된 정규식(Regular Expression) 패턴과 일치하는지 검증합니다.
이 데코레이터는 이메일, 휴대폰 번호 등 특정 형식을 강제할 때 유용합니다.

- **`pattern`**: 필드 값을 검사할 RegExp 객체. 값이 패턴과 일치하면 유효하다고 판단합니다.
- **`message`** (선택 사항): 검증 실패 시 표시할 메시지. 생략하면 기본 메시지가 사용됩니다.

---

## 사용 예시

아래는 Express 애플리케이션에서 유효성 검사 데코레이터를 사용하는 전체 예제입니다.

```ts
import express, { Request, Response, NextFunction } from 'express';
import { bindingCargo, getCargo, body, min, max, suffix, CargoValidationError } from 'express-cargo';

// 1. 바인딩 및 검증 규칙이 정의된 클래스
class CreateAssetRequest {
    @body('name')
    assetName!: string;

    @body('type')
    @suffix('.png')
    assetType!: string;

    @body('quantity')
    @min(1)
    @max(100)
    quantity!: number;
}

const app = express();
app.use(express.json());

// 2. bindingCargo 미들웨어를 라우트에 적용
app.post('/assets', bindingCargo(CreateAssetRequest), (req: Request, res: Response) => {
    // 3. 검증 성공 시 getCargo로 데이터 접근
    const assetData = getCargo<CreateAssetRequest>(req);
    res.json({
        message: 'Asset created successfully!',
        data: assetData
    });
});

// 4. 유효성 검증 에러 처리용 미들웨어 추가
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        res.status(400).json({ 
            message: 'Validation Failed',
            errors: err.errors.map(e => e.message)
        });
    } else {
        next(err);
    }
});

/*
이 엔드포인트를 테스트하려면 /assets 로 POST 요청을 보내세요.

[유효한 요청 예시]
{
    "name": "My-Asset",
    "type": "icon.png",
    "quantity": 10
}

[유효하지 않은 요청 예시]
{
    "name": "My-Asset",
    "type": "icon.jpg", // @suffix('.png') 실패
    "quantity": 101     // @max(100) 실패
}
*/
```

---

## 에러 처리 (Error Handling)

유효성 검사가 실패하면, `bindingCargo` 미들웨어는 `CargoValidationError` 예외를 발생시킵니다. 이 예외를 처리하기 위해 Express 에러 핸들링 미들웨어를 등록해야 합니다.

`CargoValidationError` 객체는 `errors` 속성을 가지며, 이 안에는 여러 개의 `CargoFieldError` 인스턴스가 배열로 포함되어 있습니다. 각각의 `CargoFieldError` 객체는 구체적인 오류 메시지를 담고 있는 `message` 속성을 포함합니다 (예: `"quantity: quantity must be <= 100"`).

코드 예시에서 보았듯이, 일반적으로는 `err.errors` 배열을 `map()`을 통해 단순한 메시지 배열로 변환해 응답을 구성합니다.

---

**에러 응답 예시:**

위의 유효하지 않은 요청을 보낼 경우, 아래와 같은 JSON 응답이 반환됩니다:

```json
{
    "message": "Validation Failed",
    "errors": [
        "type: assetType must end with .png",
        "quantity: quantity must be <= 100"
    ]
}
```
