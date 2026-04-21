# トランスフォーメーションデコレータ

Express-Cargo は、受信リクエストデータをクラスにバインドする前に自動的に変換するデコレータを提供します。これは、ユーザー入力の正規化（例: 文字列を小文字に変換）やカンマ区切り文字列の配列へのパースなどのタスクに便利です。

既存のフィールドを組み合わせて新しいフィールドを作成する仮想フィールドとは異なり、このトランスフォーメーションデコレータは単一フィールドの値を直接変更します。

## `@Transform<T>(transformer: (value: T) => T)`

これはデータ変換の主要なデコレータです。リクエストからの生の値を受け取り、フィールドの新しい変換後の値を返すトランスフォーマー関数を受け付けます。

- `transformer`: 生の値を受け取り、変換後の値を返す関数。

## 使用例

この例では、`@Transform` デコレータを使用してリクエストデータを正規化し、目的の形式に処理する方法を示しています。これは、多様なユーザー入力を処理し、API が一貫して処理することを保証するのに非常に便利で、アプリケーションの安定性を向上させます。

```typescript
import express, { Request, Response } from 'express'
import { bindingCargo, getCargo, Query, Transform } from 'express-cargo'

// 1. データ処理と正規化ルールを持つクラスを定義
class SearchRequest {
    // 一貫したソートのために 'sortBy' クエリパラメータを小文字に変換
    @Query()
    @Transform((value: string) => value.toLowerCase())
    sortBy!: string

    // 'count' クエリパラメータの値を2倍にする
    @Query()
    @Transform((value: number) => value * 2)
    count!: number
}

const app = express()
app.use(express.json())

// 2. ルートに bindingCargo ミドルウェアを適用
app.get('/search', bindingCargo(SearchRequest), (req: Request, res: Response) => {
    // 3. 正しい型で変換されたデータにアクセス
    const searchParams = getCargo<SearchRequest>(req)

    res.json({
        message: 'Search parameters transformed successfully!',
        data: searchParams,
        // 変換されたデータの型を確認
        sortByType: typeof searchParams.sortBy,
        countType: typeof searchParams.count,
    })
})

/*
このエンドポイントをテストするには、/search に GET リクエストを送信します。

リクエスト URL の例:
http://localhost:3000/search?sortBy=TITLE&count=10
*/
```

## 出力例

上記のリクエスト URL にアクセスすると、`bindingCargo` ミドルウェアがクエリパラメータを処理します。`@Transform` デコレータが `sortBy` の値を小文字の文字列に正規化し、`count` の値を2倍にします。`getCargo` 関数はこれらの変換された値を持つオブジェクトを返します。

```json
{
    "message": "Search parameters transformed successfully!", 
    "data": {
        "sortBy": "title",
        "count": 20
    },
    "sortByType": "string",
    "countType": "number"
}
```