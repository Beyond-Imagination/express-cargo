---
id: temporal
title: Temporal
---

在 Node.js 26 或更高版本中，express-cargo 会把请求值绑定到内置的 [`Temporal`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Temporal) 类型，日期验证器也接受这些类型。`Date` 字段在所有受支持的 Node.js 版本上都能继续使用。

## 运行环境要求

| 运行时 | `Date` | `Temporal` |
|---|---|---|
| Node.js 20、22、24 | 支持 | 不支持 |
| 使用 `--harmony-temporal` 的 Node.js 24 | 支持 | 不支持（实验性标志） |
| Node.js 26 或更高版本 | 支持 | 支持 |

- 仅支持 Node.js 内置的 `Temporal`。不支持 `@js-temporal/polyfill` 之类的 polyfill。
- Node.js 24 的 `--harmony-temporal` 会启用实验性的 `Temporal`，但 express-cargo 将该运行时视为不支持。
- 在不支持的运行时中，如果 DTO 声明了 Temporal 字段、`@List('plainDate')`、`@Type(() => Temporal.X)`、`@MinDuration` 或 `@MaxDuration`，调用 `bindingCargo()` 时会抛出 `CargoSchemaError`，应用因此在启动时就会停止。
- TypeScript 从 6.0 起自带 Temporal 类型。请在 `tsconfig.json` 中通过 `"lib": ["ESNext"]`（或 `"esnext.temporal"`）引入。

## 支持的类型

| 类型 | 字符串示例 | 请求体中的对象 | 可用 `@MinDate` / `@MaxDate` 排序 | `@List` 名称 |
|---|---|---|---|---|
| `Temporal.Instant` | `2026-01-01T00:00:00Z` | 否 | 是 | `'instant'` |
| `Temporal.ZonedDateTime` | `2026-01-01T09:00+09:00[Asia/Seoul]` | 是 | 是 | `'zonedDateTime'` |
| `Temporal.PlainDateTime` | `2026-01-01T09:00` | 是 | 是 | `'plainDateTime'` |
| `Temporal.PlainDate` | `2026-01-01` | 是 | 是 | `'plainDate'` |
| `Temporal.PlainTime` | `09:00` | 是 | 是 | `'plainTime'` |
| `Temporal.PlainYearMonth` | `2026-01` | 是 | 是 | `'plainYearMonth'` |
| `Temporal.PlainMonthDay` | `01-01` | 是 | 否 | `'plainMonthDay'` |
| `Temporal.Duration` | `PT1H30M` | 是 | 请使用 `@MinDuration` / `@MaxDuration` | `'duration'` |

## 使用示例

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

下面这个请求可以绑定所有字段：

```json
{
    "checkIn": "2027-03-01",
    "length": { "hours": 2 },
    "holidays": ["2027-05-05"],
    "cancelAt": "2027-02-28T18:00+09:00[Asia/Seoul]"
}
```

`booking.checkIn` 是 `Temporal.PlainDate`，`booking.length` 是 `Temporal.Duration` `PT2H`，`booking.trial` 是默认值 `P7D`，类型为 `Temporal.Duration`。

## 值的读取方式

- 来自任意来源（body、query、params、headers）的**字符串**都会用 `Temporal.X.from()` 解析。Plain 系列类型（`PlainDate`、`PlainDateTime` 等）接受带 UTC 偏移的字符串，并按 Temporal 的行为丢弃该偏移，因此 `2026-01-01T09:00+09:00` 会绑定为 `PlainDate` `2026-01-01`。以 `Z` 结尾的字符串会被拒绝。
- **对象**，例如 `{ "year": 2026, "month": 3, "day": 1 }`，只从请求体中读取，并使用 `overflow: 'reject'`，所以 `{ "month": 2, "day": 30 }` 会失败，而不会变成 3 月 2 日。`Instant` 没有对象形式。
- **历法**：只能绑定 ISO 8601 历法。`2026-01-01[u-ca=hebrew]` 或 `{ "calendar": "hebrew", ... }` 之类的值会失败。
- 同一类型的**实例**会原样保留。数字、数组和其他 Temporal 类型会失败。
- 无法读取的值会以 `<field> must be a valid <Type>` 失败，例如 `checkIn must be a valid PlainDate`。
- `@Default` 的值会像请求值一样进行类型转换，因此 `@Default('P7D')` 得到的是 `Temporal.Duration`。列表默认值在每次请求时都会得到一个新数组。

## 可为空的字段需要 `@Type`

TypeScript 会把 `Temporal.PlainDate | null` 这样的联合类型记录为 `Object`，所以 express-cargo 看不到其中的 Temporal 类型。请添加 `@Type(() => Temporal.X)`：

```typescript
class Request {
    @Body()
    @Optional()
    @Type(() => Temporal.PlainDate)
    dueDate!: Temporal.PlainDate | null
}
```

类型别名也是同样的情况。如果这类字段上有 Temporal 验证器却没有 `@Type`，或者在没有 `@List` 的情况下把它放进 `@Each`，启动时会抛出 `CargoSchemaError`，因为值会一直是字符串，每个请求都会失败。

## 验证器

### `@MinDate` 和 `@MaxDate`

边界值必须与字段是同一类型，例如 `PlainDate` 字段对应 `Temporal.PlainDate`，也可以是返回该类型的函数：

```typescript
@Body()
@MinDate(Temporal.PlainTime.from('09:00'))
@MaxDate(Temporal.PlainTime.from('18:00'))
startsAt!: Temporal.PlainTime
```

- 默认消息形如 `startsAt must be on or after 09:00:00`。
- 固定边界的类型与字段不同时，例如 `PlainDate` 字段上使用 `PlainDateTime` 边界，启动时会抛出 `CargoSchemaError`。返回其他类型的函数边界会在验证请求时抛出错误，Express 的默认错误处理器会以 500 响应。
- 它们不能用于没有先后顺序的 `PlainMonthDay`，也不能用于 `Duration`；请改用 `@MinDuration` / `@MaxDuration`。

### `@MinDuration` 和 `@MaxDuration`

它们用来检查 `Temporal.Duration` 字段，边界值可以是 `Temporal.Duration` 或 ISO 8601 字符串：

```typescript
@Body()
@MinDuration('PT0S')
@MaxDuration('P1D')
timeout!: Temporal.Duration
```

- 一天按 24 小时计算，所以 `P1D` 等于 `PT24H`。
- 年、月、周没有固定长度，所以 `P1M` 这样的边界值会在启动时抛出 `CargoSchemaError`。以这些单位给出的值会以 `<field> must be given in days or smaller units, such as P7D, not in years, months or weeks` 失败。
- Duration 可以为负。只有 `@MaxDuration` 的字段会接受 `-PT1H`；如需拒绝，请添加 `@MinDuration('PT0S')`。

### `@Equal`、`@NotEqual` 和 `@OneOf`

`Date` 按时间比较，Temporal 值通过 Temporal 的 `equals()` 比较，所以表示同一天的两个 `PlainDate` 相等：

```typescript
@Body()
@OneOf([Temporal.PlainTime.from('09:00'), Temporal.PlainTime.from('15:00')])
slot!: Temporal.PlainTime
```

- 使用其他类型的值会在启动时抛出 `CargoSchemaError`，例如在 `PlainYearMonth` 上使用 `@Equal('2026-11')`；请改用 `Temporal.PlainYearMonth.from('2026-11')`。
- `ZonedDateTime` 只有在时区也一致时才相等，所以 `2026-01-01T09:00+09:00[Asia/Seoul]` 和 `2026-01-01T00:00Z[UTC]` 不相等。
- `Duration` 只有在每个单位都一致时才相等，所以 `PT60M` 和 `PT1H` 不相等。

## 注意事项

- 查询字符串中的 **`+`** 会变成空格。发送偏移量时请写成 `%2B09:00`。
- **夏令时**：`ZonedDateTime` 中不存在或出现两次的本地时间，会按 Temporal 的 `disambiguation: 'compatible'` 处理，不会报错。
- **闰秒**：`23:59:60` 会被读作 `23:59:59`。
- **`@Transform`**：带有 `@Transform` 的字段接收的是转换函数返回的值。如果转换函数从重复的查询键中挑出某个元素，该元素不会被类型转换。
- **Session 值**与其他来源经过同样的类型转换：字符串可以绑定，而从 JSON session 存储中读回的对象会失败。
