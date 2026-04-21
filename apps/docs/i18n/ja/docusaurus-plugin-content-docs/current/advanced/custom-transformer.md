# カスタムトランスフォーマー

`@Transform` デコレーターを使用すると、Express-Cargoの組み込み型キャスティングの**後に**実行されるカスタム変換ロジックを定義できます。単純な型変換を超えた高度な入力正規化に最適です。

基本的な `@Transform` の使い方は [Transformation Decorator](/decorators/transforms) ページをご覧ください。

## 実行順序

`@Transform` が実行されるタイミングを理解することが重要です：

1. リクエストソース（`@Query`、`@Body` など）から生の値を抽出
2. **組み込み型キャスティング**が宣言された型（`String`、`Number`、`Boolean`、`Date`）に変換
3. **`@Transform`** が型キャスティング済みの値に対して実行
4. **バリデーション**が最終結果に適用

つまり、トランスフォーマー関数は生の文字列ではなく、型キャスティング済みの値を受け取ります。

## 実用レシピ

### カンマ区切り文字列を配列に変換

クエリパラメータは常に文字列です。APIがカンマ区切りリスト（例：`?tags=a,b,c`）を受け付ける場合、配列に分割できます：

```typescript
class SearchRequest {
    @Query()
    @Transform((value: string) => value.split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// 結果: { tags: ['node', 'express', 'cargo'] }
```

### Boolean風文字列のキャスティング

Express-Cargoは `"true"` を `true` に自動キャストしますが、`"yes"`、`"1"`、`"on"` などの他のtruthy値を処理する必要がある場合があります：

```typescript
class FilterRequest {
    @Query()
    @Transform((value: string) => ['true', 'yes', '1', 'on'].includes(String(value).toLowerCase()))
    active!: boolean
}

// GET /filter?active=yes → { active: true }
// GET /filter?active=0   → { active: false }
```

### Enumの正規化

ユーザー入力を期待するenum値に合わせて正規化します：

```typescript
enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

class ListRequest {
    @Query()
    @Transform((value: string) => value.toLowerCase() as SortOrder)
    order!: SortOrder
}

// GET /list?order=DESC → { order: 'desc' }
```

### 文字列入力のサニタイズ

不要な文字を削除したり、空白を正規化します：

```typescript
class CommentRequest {
    @Body()
    @Transform((value: string) => value.trim().replace(/\s+/g, ' '))
    content!: string
}

// POST { content: "  hello   world  " } → { content: "hello world" }
```

### 数値範囲の制限

数値が許容範囲内に収まるようにします：

```typescript
class PaginationRequest {
    @Query()
    @Transform((value: number) => Math.min(Math.max(value, 1), 100))
    limit!: number
}

// GET /items?limit=500 → { limit: 100 }
// GET /items?limit=-5  → { limit: 1 }
```

### 日付の操作

パースされた日付に調整を適用します：

```typescript
class ReportRequest {
    @Query()
    @Transform((value: Date) => {
        // 時刻をその日の開始（00:00:00）に設定
        value.setHours(0, 0, 0, 0)
        return value
    })
    startDate!: Date
}
```

## 他のデコレーターとの組み合わせ

`@Transform` は他のExpress-Cargoデコレーターとシームレスに連携できます：

```typescript
class ProductQuery {
    @Query('q')
    @Transform((value: string) => value.toLowerCase().trim())
    @IsNotEmpty()
    searchTerm!: string

    @Query()
    @Default(10)
    @Transform((value: number) => Math.min(value, 50))
    limit!: number
}
```

:::tip
トランスフォーマー関数はシンプルに保ち、単一の責任に集中させましょう。複雑な多段階変換が必要な場合は、ユーティリティ関数を組み合わせることを検討してください：

```typescript
const normalize = (v: string) => v.trim().toLowerCase()
const clamp = (min: number, max: number) => (v: number) => Math.min(Math.max(v, min), max)

class Request {
    @Query()
    @Transform(normalize)
    keyword!: string

    @Query()
    @Transform(clamp(1, 100))
    page!: number
}
```
:::