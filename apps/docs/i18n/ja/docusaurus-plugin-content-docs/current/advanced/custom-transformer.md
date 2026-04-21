# カスタムトランスフォーマー

`@Transform` デコレーターを使用すると、Express-Cargoの組み込み型キャスティングの**後に**実行されるカスタム変換ロジックを定義できます。型がすでに確定した値を正規化・範囲制限・サニタイズするなど、**値を洗練させる**ためのものであり、フィールドの型を変更するためのものではありません。

基本的な `@Transform` の使い方は [Transformation Decorator](/decorators/transforms) ページをご覧ください。

:::note `@Transform` は型ではなく値を洗練させます
組み込み型キャスティング（`String`、`Number`、`Boolean`、`Date`、`Array`）がトランスフォーマーより先に実行されるため、関数はすでにキャストされた値を受け取り、同じ型を返す必要があります。生のリクエスト値が宣言された型と一致しない場合（例：`string[]` として宣言されたフィールドにカンマ区切り文字列が届く場合）、トランスフォーマーが実行される前に型キャスティングの段階で失敗します。

生のソースと異なる形状の値を生成する必要がある場合（区切り文字で分割された文字列を配列にパース、複数の truthy 表現を boolean として受け取るなど）は、代わりに [`@Request`](/decorators/virtual) デコレーターを使用してください。組み込み型キャスティングを完全にバイパスし、`Request` オブジェクトを直接扱えます。下記の [`@Request` を使うべきケース](#when-to-use-request-instead) セクションを参照してください。
:::

## 実行順序

`@Transform` が実行されるタイミングを理解することが重要です：

1. リクエストソース（`@Query`、`@Body` など）から生の値を抽出
2. **組み込み型キャスティング**が宣言された型（`String`、`Number`、`Boolean`、`Date`）に変換
3. **`@Transform`** が型キャスティング済みの値に対して実行
4. **バリデーション**が最終結果に適用

つまり、トランスフォーマー関数は生の文字列ではなく、型キャスティング済みの値を受け取ります。

## 実用レシピ

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

## `@Request` を使うべきケース {#when-to-use-request-instead}

リクエスト値を単に洗練するのではなく、**別の型に再構成**する必要がある場合、`@Transform` は適切ではありません。組み込み型キャスティングが先に実行され、トランスフォーマーに到達する前に失敗するか、期待と異なる値に強制変換されてしまうためです。このような場合は、[`@Request`](/decorators/virtual) を使って型キャスティングをバイパスし、`Request` オブジェクトを直接扱ってください。

### カンマ区切り文字列を配列に

```typescript
class SearchRequest {
    @Request(req => String(req.query.tags ?? '').split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// 結果: { tags: ['node', 'express', 'cargo'] }
```

### 柔軟な boolean パース

`"true"` だけでなく `"yes"`、`"1"`、`"on"` など複数の truthy 表現を許可します：

```typescript
class FilterRequest {
    @Request(req => {
        const raw = String(req.query.active ?? '').toLowerCase()
        return ['true', 'yes', '1', 'on'].includes(raw)
    })
    active!: boolean
}

// GET /filter?active=yes → { active: true }
// GET /filter?active=0   → { active: false }
```