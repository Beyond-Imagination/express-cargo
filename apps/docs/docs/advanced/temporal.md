---
id: temporal
title: Temporal
---

On Node.js 26 or later, express-cargo binds request values to the built-in [`Temporal`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) types, and the date validators accept them. `Date` fields keep working on every supported Node.js version.

## Requirements

| Runtime | `Date` | `Temporal` |
|---|---|---|
| Node.js 20, 22, 24 | Supported | Not supported |
| Node.js 24 with `--harmony-temporal` | Supported | Not supported (experimental flag) |
| Node.js 26 or later | Supported | Supported |

- Only the `Temporal` built into Node.js is supported. A polyfill such as `@js-temporal/polyfill` is not.
- On Node.js 24, `--harmony-temporal` exposes an experimental `Temporal`, but express-cargo treats that runtime as unsupported.
- On a runtime without support, a DTO that declares a Temporal field, `@List('plainDate')`, `@Type(() => Temporal.X)`, `@MinDuration` or `@MaxDuration` throws a `CargoSchemaError` when `bindingCargo()` is called, so the app stops at startup.
- TypeScript ships Temporal types from 6.0. Include them with `"lib": ["ESNext"]` (or `"esnext.temporal"`) in `tsconfig.json`.

## Supported types

| Type | String example | Object in body | Ordered by `@MinDate` / `@MaxDate` | `@List` name |
|---|---|---|---|---|
| `Temporal.Instant` | `2026-01-01T00:00:00Z` | No | Yes | `'instant'` |
| `Temporal.ZonedDateTime` | `2026-01-01T09:00+09:00[Asia/Seoul]` | Yes | Yes | `'zonedDateTime'` |
| `Temporal.PlainDateTime` | `2026-01-01T09:00` | Yes | Yes | `'plainDateTime'` |
| `Temporal.PlainDate` | `2026-01-01` | Yes | Yes | `'plainDate'` |
| `Temporal.PlainTime` | `09:00` | Yes | Yes | `'plainTime'` |
| `Temporal.PlainYearMonth` | `2026-01` | Yes | Yes | `'plainYearMonth'` |
| `Temporal.PlainMonthDay` | `01-01` | Yes | No | `'plainMonthDay'` |
| `Temporal.Duration` | `PT1H30M` | Yes | Use `@MinDuration` / `@MaxDuration` | `'duration'` |

## Example

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

This request binds every field:

```json
{
    "checkIn": "2027-03-01",
    "length": { "hours": 2 },
    "holidays": ["2027-05-05"],
    "cancelAt": "2027-02-28T18:00+09:00[Asia/Seoul]"
}
```

`booking.checkIn` is a `Temporal.PlainDate`, `booking.length` is the `Temporal.Duration` `PT2H`, and `booking.trial` is the default `P7D` as a `Temporal.Duration`.

## How values are read

- **Strings** from any source (body, query, params, headers) are parsed with `Temporal.X.from()`. Plain types (`PlainDate`, `PlainDateTime` and so on) accept a string with a UTC offset and drop the offset, as Temporal does, so `2026-01-01T09:00+09:00` binds to the `PlainDate` `2026-01-01`. A string ending in `Z` is rejected for them.
- **Objects** such as `{ "year": 2026, "month": 3, "day": 1 }` are read from the request body only, with `overflow: 'reject'`, so `{ "month": 2, "day": 30 }` fails instead of becoming March 2. `Instant` has no object form.
- **Calendars**: only the ISO 8601 calendar binds. A value such as `2026-01-01[u-ca=hebrew]` or `{ "calendar": "hebrew", ... }` fails.
- **Instances** of the same type are kept as they are. Numbers, arrays and other Temporal types fail.
- A value that cannot be read fails with `<field> must be a valid <Type>`, such as `checkIn must be a valid PlainDate`.
- `@Default` values are cast like request values, so `@Default('P7D')` gives a `Temporal.Duration`. A list default gets a new array on every request.

## Nullable fields need `@Type`

TypeScript records a union such as `Temporal.PlainDate | null` as `Object`, so express-cargo cannot see the Temporal type. Add `@Type(() => Temporal.X)`:

```typescript
class Request {
    @Body()
    @Optional()
    @Type(() => Temporal.PlainDate)
    dueDate!: Temporal.PlainDate | null
}
```

The same holds for a type alias. A Temporal validator on such a field without `@Type`, or inside `@Each` without `@List`, throws a `CargoSchemaError` at startup, since the value would stay a string and fail every request.

## Validators

### `@MinDate` and `@MaxDate`

The bound must be the same type as the field, such as a `Temporal.PlainDate` on a `PlainDate` field, or a function that returns one:

```typescript
@Body()
@MinDate(Temporal.PlainTime.from('09:00'))
@MaxDate(Temporal.PlainTime.from('18:00'))
startsAt!: Temporal.PlainTime
```

- The default message reads `startsAt must be on or after 09:00:00`.
- A fixed bound of another type, such as a `PlainDateTime` bound on a `PlainDate` field, throws a `CargoSchemaError` at startup. A function bound that returns another type throws when the request is validated, which Express's default error handler answers with a 500.
- They cannot be used on `PlainMonthDay`, which has no order, or on `Duration`; use `@MinDuration` / `@MaxDuration` instead.

### `@MinDuration` and `@MaxDuration`

They check a `Temporal.Duration` field against a bound given as a `Temporal.Duration` or an ISO 8601 string:

```typescript
@Body()
@MinDuration('PT0S')
@MaxDuration('P1D')
timeout!: Temporal.Duration
```

- A day counts as 24 hours, so `P1D` equals `PT24H`.
- Years, months and weeks have no fixed length, so a bound such as `P1M` throws a `CargoSchemaError` at startup. A value in those units fails with `<field> must be given in days or smaller units, such as P7D, not in years, months or weeks`.
- Durations can be negative. A field with only `@MaxDuration` accepts `-PT1H`; add `@MinDuration('PT0S')` to reject it.

### `@Equal`, `@NotEqual` and `@OneOf`

Dates are compared by their time and Temporal values with Temporal's `equals()`, so two `PlainDate`s for the same day are equal:

```typescript
@Body()
@OneOf([Temporal.PlainTime.from('09:00'), Temporal.PlainTime.from('15:00')])
slot!: Temporal.PlainTime
```

- A value of another type throws a `CargoSchemaError` at startup, such as `@Equal('2026-11')` on a `PlainYearMonth`; use `Temporal.PlainYearMonth.from('2026-11')`.
- `ZonedDateTime` values are equal only when the time zone also matches, so `2026-01-01T09:00+09:00[Asia/Seoul]` and `2026-01-01T00:00Z[UTC]` differ.
- `Duration` values are equal only when every unit matches, so `PT60M` and `PT1H` differ.

## Things to know

- **`+` in a query string** becomes a space. Send an offset as `%2B09:00`.
- **Daylight saving time**: a local time that does not exist or occurs twice in a `ZonedDateTime` is resolved as Temporal's `disambiguation: 'compatible'` does, without an error.
- **Leap seconds**: `23:59:60` is read as `23:59:59`.
- **`@Transform`**: a field with `@Transform` receives the value the transform returns. If the transform picks an element from a repeated query key, that element is not cast.
- **Session values** go through the same cast as other sources: a string binds, while an object read back from a JSON session store fails.
