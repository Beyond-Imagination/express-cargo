# List デコレータ

Express-Cargo の `@List` デコレータを使用すると、リクエストから配列型を自動的にバインドしてキャストできます。これは、フィールドが文字列、数値、カスタムオブジェクトなどの特定の型の配列であることを期待する場合に便利です。

## 使用例

```typescript
import express, { Router } from 'express'
import { Body, List, bindingCargo, getCargo } from 'express-cargo'

const router: Router = express.Router()

// 1. カスタムクラスを定義（オプション）
class CustomClass {
    @Body()
    name!: string

    @Body()
    age!: number
}

// 2. 配列フィールドを持つクラスを定義
class ListSample {
    @Body()
    @List(String)
    stringArray!: string[]

    @Body()
    @List(Number)
    numberArray!: number[]

    @Body()
    @List(Boolean)
    booleanArray!: boolean[]

    @Body()
    @List(Date)
    dateArray!: Date[]

    @Body()
    @List('string')
    stringLiteralArray!: string[]

    @Body()
    @List(CustomClass)
    customClassArray!: CustomClass[]
}

// 3. Express ルートをセットアップ
router.post('/list', bindingCargo(ListSample), (req, res) => {
    const cargo = getCargo<ListSample>(req)
    res.json(cargo)
})

export default router
```

## 出力例

以下の JSON ボディで `/list` に POST リクエストを送信した場合：

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

`getCargo` 関数は完全に構成された `ListSample` オブジェクトを返します：

```typescript
// getCargo<ListSample>(req) が返すオブジェクト:
const cargo = {
  stringArray: ["apple", "banana"],
  numberArray: [1, 2, 3],
  booleanArray: [true, false],
  dateArray: [
    // 実際の Date オブジェクト
    new Date("2024-01-01T00:00:00.000Z"),
    new Date("2024-01-02T00:00:00.000Z")
  ],
  stringLiteralArray: ["one", "two"],
  customClassArray: [
    // CustomClass のインスタンス
    { name: "John", age: 30 },
    { name: "Jane", age: 25 }
  ]
};
```