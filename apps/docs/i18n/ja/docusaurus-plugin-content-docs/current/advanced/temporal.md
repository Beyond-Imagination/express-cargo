---
id: temporal
title: Temporal
---

Node.js 26 以降では、express-cargo はリクエストの値を組み込みの [`Temporal`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Temporal) 型にバインドし、日付バリデータもこれらの型を受け付けます。`Date` フィールドは、サポートされるすべての Node.js バージョンで引き続き動作します。

## 要件

| ランタイム | `Date` | `Temporal` |
|---|---|---|
| Node.js 20、22、24 | 対応 | 非対応 |
| Node.js 24（`--harmony-temporal` 使用時） | 対応 | 非対応（実験的フラグ） |
| Node.js 26 以降 | 対応 | 対応 |

- Node.js に組み込まれた `Temporal` のみがサポートされます。`@js-temporal/polyfill` などのポリフィルはサポートされません。
- Node.js 24 の `--harmony-temporal` は実験的な `Temporal` を有効にしますが、express-cargo はこのランタイムをサポート対象外として扱います。
- サポートされていないランタイムで、Temporal フィールド、`@List('plainDate')`、`@Type(() => Temporal.X)`、`@MinDuration`、`@MaxDuration` のいずれかを宣言した DTO は、`bindingCargo()` の呼び出し時に `CargoSchemaError` をスローするため、アプリは起動時に停止します。
- TypeScript は 6.0 から Temporal の型定義を提供します。`tsconfig.json` で `"lib": ["ESNext"]`（または `"esnext.temporal"`）を指定して含めてください。

## サポートされる型

| 型 | 文字列の例 | body 内のオブジェクト | `@MinDate` / `@MaxDate` による順序比較 | `@List` の名前 |
|---|---|---|---|---|
| `Temporal.Instant` | `2026-01-01T00:00:00Z` | いいえ | はい | `'instant'` |
| `Temporal.ZonedDateTime` | `2026-01-01T09:00+09:00[Asia/Seoul]` | はい | はい | `'zonedDateTime'` |
| `Temporal.PlainDateTime` | `2026-01-01T09:00` | はい | はい | `'plainDateTime'` |
| `Temporal.PlainDate` | `2026-01-01` | はい | はい | `'plainDate'` |
| `Temporal.PlainTime` | `09:00` | はい | はい | `'plainTime'` |
| `Temporal.PlainYearMonth` | `2026-01` | はい | はい | `'plainYearMonth'` |
| `Temporal.PlainMonthDay` | `01-01` | はい | いいえ | `'plainMonthDay'` |
| `Temporal.Duration` | `PT1H30M` | はい | `@MinDuration` / `@MaxDuration` を使用 | `'duration'` |

## 使用例

```typescript
import express from 'express'
import { Body, bindingCargo, Default, Each, getCargo, List, MaxDate, MaxDuration, MinDate, MinDuration, Optional, Type } from 'express-cargo'

class BookingRequest {
    @Body()
    @MinDate(() => Temporal.Now.plainDateISO())
    checkIn!: Temporal.PlainDate

    @Body()
    @MinDuration('PT30M')
    @MaxDuration('PT4H')
    length!: Temporal.Duration

    @Body()
    @List('plainDate')
    @Each(MaxDate(Temporal.PlainDate.from('2027-12-31')))
    holidays!: Temporal.PlainDate[]

    @Body()
    @Optional()
    @Type(() => Temporal.ZonedDateTime)
    cancelAt!: Temporal.ZonedDateTime | null

    @Body()
    @Default('P7D')
    trial!: Temporal.Duration
}

const app = express()
app.use(express.json())

app.post('/bookings', bindingCargo(BookingRequest), (req, res) => {
    const booking = getCargo<BookingRequest>(req)
    const checkOut = booking.checkIn.add({ days: 2 })
    res.json({ checkIn: booking.checkIn, checkOut, length: booking.length, trial: booking.trial })
})
```

次のリクエストはすべてのフィールドにバインドされます。

```json
{
    "checkIn": "2027-03-01",
    "length": { "hours": 2 },
    "holidays": ["2027-05-05"],
    "cancelAt": "2027-02-28T18:00+09:00[Asia/Seoul]"
}
```

`booking.checkIn` は `Temporal.PlainDate`、`booking.length` は `Temporal.Duration` の `PT2H`、`booking.trial` はデフォルト値 `P7D` を `Temporal.Duration` にしたものです。

## 値の読み取り方

- **文字列**は、どのソース（body、query、params、headers）からでも `Temporal.X.from()` で解析されます。Plain 型（`PlainDate`、`PlainDateTime` など）は UTC オフセット付きの文字列を受け付け、Temporal と同様にオフセットを破棄するため、`2026-01-01T09:00+09:00` は `PlainDate` の `2026-01-01` にバインドされます。末尾が `Z` の文字列は拒否されます。
- `{ "year": 2026, "month": 3, "day": 1 }` のような**オブジェクト**は、リクエストの body からのみ `overflow: 'reject'` で読み取られるため、`{ "month": 2, "day": 30 }` は 3 月 2 日にならず失敗します。`Instant` にはオブジェクト形式がありません。
- **カレンダー**: ISO 8601 カレンダーのみバインドされます。`2026-01-01[u-ca=hebrew]` や `{ "calendar": "hebrew", ... }` のような値は失敗します。
- 同じ型の**インスタンス**はそのまま保持されます。数値、配列、他の Temporal 型は失敗します。
- 読み取れない値は、`checkIn must be a valid PlainDate` のように `<field> must be a valid <Type>` というメッセージで失敗します。
- `@Default` の値はリクエストの値と同様にキャストされるため、`@Default('P7D')` は `Temporal.Duration` になります。リストのデフォルト値は、リクエストごとに新しい配列になります。

## null 許容フィールドには `@Type` が必要

TypeScript は `Temporal.PlainDate | null` のようなユニオン型を `Object` として記録するため、express-cargo は Temporal 型を認識できません。`@Type(() => Temporal.X)` を追加してください。

```typescript
class Request {
    @Body()
    @Optional()
    @Type(() => Temporal.PlainDate)
    dueDate!: Temporal.PlainDate | null
}
```

型エイリアスでも同じです。このようなフィールドに `@Type` なしで Temporal バリデータを付けた場合や、`@List` なしで `@Each` の中に付けた場合は、値が文字列のままになってすべてのリクエストが失敗してしまうため、起動時に `CargoSchemaError` をスローします。

## バリデータ

### `@MinDate` and `@MaxDate`

境界値はフィールドと同じ型（`PlainDate` フィールドなら `Temporal.PlainDate`）か、それを返す関数でなければなりません。

```typescript
@Body()
@MinDate(Temporal.PlainTime.from('09:00'))
@MaxDate(Temporal.PlainTime.from('18:00'))
startsAt!: Temporal.PlainTime
```

- デフォルトメッセージは `startsAt must be on or after 09:00:00` のようになります。
- `PlainDate` フィールドに `PlainDateTime` の境界値を指定するなど、他の型の固定境界値は起動時に `CargoSchemaError` をスローします。他の型を返す関数の境界値は、リクエストの検証時にスローされ、Express のデフォルトのエラーハンドラーは 500 で応答します。
- 順序のない `PlainMonthDay` や `Duration` には使用できません。代わりに `@MinDuration` / `@MaxDuration` を使用してください。

### `@MinDuration` and `@MaxDuration`

`Temporal.Duration` フィールドを、`Temporal.Duration` または ISO 8601 文字列で指定した境界値と照らして検証します。

```typescript
@Body()
@MinDuration('PT0S')
@MaxDuration('P1D')
timeout!: Temporal.Duration
```

- 1 日は 24 時間として数えるため、`P1D` は `PT24H` と等しくなります。
- 年、月、週は長さが一定ではないため、`P1M` のような境界値は起動時に `CargoSchemaError` をスローします。これらの単位で指定された値は `<field> must be given in days or smaller units, such as P7D, not in years, months or weeks` というメッセージで失敗します。
- Duration は負の値になることがあります。`@MaxDuration` のみのフィールドは `-PT1H` を受け付けます。拒否するには `@MinDuration('PT0S')` を追加してください。

### `@Equal`, `@NotEqual` and `@OneOf`

`Date` は時刻で、Temporal の値は Temporal の `equals()` で比較されるため、同じ日を表す 2 つの `PlainDate` は等しくなります。

```typescript
@Body()
@OneOf([Temporal.PlainTime.from('09:00'), Temporal.PlainTime.from('15:00')])
slot!: Temporal.PlainTime
```

- `PlainYearMonth` に `@Equal('2026-11')` を指定するなど、他の型の値は起動時に `CargoSchemaError` をスローします。`Temporal.PlainYearMonth.from('2026-11')` を使用してください。
- `ZonedDateTime` の値は、タイムゾーンも一致する場合にのみ等しくなるため、`2026-01-01T09:00+09:00[Asia/Seoul]` と `2026-01-01T00:00Z[UTC]` は異なります。
- `Duration` の値は、すべての単位が一致する場合にのみ等しくなるため、`PT60M` と `PT1H` は異なります。

## 知っておくべきこと

- クエリ文字列内の **`+`** は空白になります。オフセットは `%2B09:00` として送信してください。
- **夏時間**: `ZonedDateTime` で存在しない、または 2 回現れるローカル時刻は、エラーにならず、Temporal の `disambiguation: 'compatible'` と同じ方法で解決されます。
- **うるう秒**: `23:59:60` は `23:59:59` として読み取られます。
- **`@Transform`**: `@Transform` を持つフィールドは、トランスフォームが返した値を受け取ります。トランスフォームが繰り返されたクエリキーから要素を選ぶ場合、その要素はキャストされません。
- **セッション値**は他のソースと同じキャストを通ります。文字列はバインドされますが、JSON セッションストアから読み戻したオブジェクトは失敗します。
