---
id: default
title: 기본값 데코레이터
---

# Default Field Decorator

Express-Cargo는 요청 필드에 기본값을 정의할 수 있는 데코레이터를 제공합니다. 이 데코레이터는 요청에서 값이 제공되지 않았을 때(undefined 또는 null) 자동으로 기본값을 할당합니다.

## Built-in Default Decorator

### `@Default(value: T)`

@Default 데코레이터는 요청에서 해당 필드가 제공되지 않았을 경우 클래스 프로퍼티에 기본값을 할당합니다.

- **`value`**: 요청에서 값이 없을 경우 할당할 기본값

```typescript
class Request {
    @body()
    @Default(1)
    price!: number;
}
```
