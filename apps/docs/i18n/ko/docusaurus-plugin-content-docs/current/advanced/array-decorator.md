---
id: array-decorator
title: Array 데코레이터
---
# Array 데코레이터

Express-Cargo의 `@Array` 데코레이터를 사용하면 요청에서 배열 유형을 자동으로 바인딩하고 캐스팅할 수 있습니다. 이는 필드가 문자열, 숫자 또는 사용자 정의 객체와 같은 특정 유형의 배열일 것으로 예상될 때 유용합니다.

## 사용 예시

```typescript
import express, { Router } from 'express'
import { Body, Array, bindingCargo, getCargo } from 'express-cargo'

const router: Router = express.Router()

// 1. 사용자 정의 클래스 정의 (선택 사항)
class CustomClass {
    @Body()
    name!: string

    @Body()
    age!: number
}

// 2. 배열 필드를 사용하여 클래스 정의
class ArraySample {
    @Body()
    @Array(String)
    stringArray!: string[]

    @Body()
    @Array(Number)
    numberArray!: number[]

    @Body()
    @Array(Boolean)
    booleanArray!: boolean[]

    @Body()
    @Array(Date)
    dateArray!: Date[]

    @Body()
    @Array('string')
    stringLiteralArray!: string[]

    @Body()
    @Array(CustomClass)
    customClassArray!: CustomClass[]
}

// 3. Express 라우트 설정
router.post('/array', bindingCargo(ArraySample), (req, res) => {
    const cargo = getCargo<ArraySample>(req)
    res.json(cargo)
})

export default router
```

## 출력 예시

다음 JSON 본문과 함께 `/array`로 POST 요청을 보내는 경우:

```json
{
    "stringArray": ["apple", "banana"],
    "numberArray": [1, 2, 3],
    "booleanArray": [true, false],
    "dateArray": ["2024-01-01", "2024-01-02"],
    "stringLiteralArray": ["one", "two"],
    "customClassArray": [
        { "name": "John", "age": 30 },
        { "name": "Jane", "age": 25 }
    ]
}
```

`getCargo` 함수는 완전히 채워진 `ArraySample` 객체를 반환합니다:

```typescript
// getCargo<ArraySample>(req)에 의해 반환된 객체:
const cargo = {
  stringArray: ["apple", "banana"],
  numberArray: [1, 2, 3],
  booleanArray: [true, false],
  dateArray: [
    // 실제로는 Date 객체입니다
    new Date("2024-01-01T00:00:00.000Z"),
    new Date("2024-01-02T00:00:00.000Z")
  ],
  stringLiteralArray: ["one", "two"],
  customClassArray: [
      // 실제로는 CustomClass의 인스턴스입니다
    { name: "John", age: 30 },
    { name: "Jane", age: 25 }
  ]
};
```
