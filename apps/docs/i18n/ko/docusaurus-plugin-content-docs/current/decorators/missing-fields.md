---
id: missing-fields
title: 필드 누락 처리
---

# 필드 누락 처리

필드가 **요청에 존재하지 않을 때**(값이 `undefined` 또는 `null`), Express-Cargo는 어떻게 처리할지 알아야 합니다. 이 동작은 두 개의 데코레이터로 제어합니다.

- **`@Default(value)`** — 대체 값을 채워 넣습니다.
- **`@Optional()`** — "required" 오류를 발생시키지 않고 필드를 비워 둘 수 있게 합니다.

둘 다 "필드가 없을 때 무엇을 할지"라는 같은 것을 결정하므로 **상호 배타적**입니다. 같은 필드에 둘을 모두 적용하면 스키마 오류가 발생합니다.

필드에 **두 데코레이터가 모두 작용되지 않고** 값이 누락되면, 바인딩은 `<field> is required` 검증 오류로 실패합니다.

## `@Default(value: T)`

`@Default` 데코레이터는 요청이 값을 제공하지 않을 때 클래스 속성에 기본값을 할당합니다.

- **`value`**: 필드가 요청에 존재하지 않을 때 할당할 기본값.

```typescript
class Request {
    @Body()
    @Default(1)
    price!: number;
}
```

### 기본값이 적용되는 시점

기본값은 **들어온 값이 `undefined` 또는 `null`일 때만**(즉, 필드가 요청에 누락된 경우에만) 적용됩니다. 요청에서 들어온 그 외의 값은 그대로 유지됩니다.

즉, `0`, `''`, `false`와 같은 falsy 값은 실제 입력으로 취급되어 기본값을 **적용하지 않습니다.**.

```typescript
class Request {
    @Body()
    @Default(10)
    quantity!: number
}
```

| 들어온 `quantity`     | 바인딩된 값          |
|-----------------------|----------------------|
| 누락 / `undefined`    | `10` (기본값 적용)   |
| `null`                | `10` (기본값 적용)   |
| `0`                   | `0` (유지)           |
| `5`                   | `5` (유지)           |

## `@Optional()`

`@Optional` 데코레이터는 필드를 선택 사항으로 표시하여, "required" 오류를 발생시키지 않고 필드를 생략하거나 `undefined`/`null`로 설정할 수 있도록 합니다. 필드가 누락되면 `null`로 남고, 해당 필드의 검증 규칙은 건너뜁니다.

```typescript
class Request {
    @Body()
    @Min(0)
    @Optional()
    discount?: number
}
```

여기서 누락된 `discount`는 `null`로 바인딩되고 `@Min(0)` 규칙은 건너뜁니다. `discount`가 **제공되면** 정상적으로 검증됩니다.

## `@Default`와 `@Optional` 중 선택

| | 필드 누락 | 필드 제공 |
|---|---|---|
| `@Default(value)` | `value`로 바인딩 | 값 유지 및 검증 |
| `@Optional()` | `null`로 바인딩 | 값 유지 및 검증 |
| 둘 다 없음 | `<field> is required` 오류 | 값 유지 및 검증 |

필드마다 **하나의** 전략을 선택하세요.

```typescript
class Request {
    // ❌ 잘못된 사용: 필드는 하나의 누락된 값 처리 전략만 사용할 수 있습니다.
    @Body()
    @Default(1)
    @Optional()
    price!: number
}
```
