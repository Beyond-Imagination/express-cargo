---
id: temporal
title: Temporal
---

Node.js 26 이상에서는 express-cargo가 요청 값을 기본 내장 [`Temporal`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Temporal) 타입으로 바인딩하고, 날짜 검증자도 Temporal 값을 받습니다. `Date` 필드는 지원하는 모든 Node.js 버전에서 그대로 동작합니다.

## 요구 사항

| 런타임 | `Date` | `Temporal` |
|---|---|---|
| Node.js 20, 22, 24 | 지원 | 지원 안 함 |
| Node.js 24 + `--harmony-temporal` | 지원 | 지원 안 함 (실험용 플래그) |
| Node.js 26 이상 | 지원 | 지원 |

- Node.js에 기본 내장된 `Temporal`만 지원합니다. `@js-temporal/polyfill` 같은 폴리필은 지원하지 않습니다.
- Node.js 24의 `--harmony-temporal`은 실험용 `Temporal`을 켜지만 express-cargo는 이 런타임을 지원 대상으로 보지 않습니다.
- 지원하지 않는 런타임에서 Temporal 필드, `@List('plainDate')`, `@Type(() => Temporal.X)`, `@MinDuration`, `@MaxDuration`을 선언한 DTO는 `bindingCargo()`를 호출할 때 `CargoSchemaError`를 던집니다. 그래서 앱이 시작할 때 멈춥니다.
- TypeScript는 6.0부터 Temporal 타입을 제공합니다. `tsconfig.json`의 `"lib"`에 `"ESNext"`(또는 `"esnext.temporal"`)를 넣으세요.

## 지원 타입

| 타입 | 문자열 예 | 본문 객체 입력 | `@MinDate` / `@MaxDate` 비교 | `@List` 이름 |
|---|---|---|---|---|
| `Temporal.Instant` | `2026-01-01T00:00:00Z` | 불가 | 가능 | `'instant'` |
| `Temporal.ZonedDateTime` | `2026-01-01T09:00+09:00[Asia/Seoul]` | 가능 | 가능 | `'zonedDateTime'` |
| `Temporal.PlainDateTime` | `2026-01-01T09:00` | 가능 | 가능 | `'plainDateTime'` |
| `Temporal.PlainDate` | `2026-01-01` | 가능 | 가능 | `'plainDate'` |
| `Temporal.PlainTime` | `09:00` | 가능 | 가능 | `'plainTime'` |
| `Temporal.PlainYearMonth` | `2026-01` | 가능 | 가능 | `'plainYearMonth'` |
| `Temporal.PlainMonthDay` | `01-01` | 가능 | 불가 | `'plainMonthDay'` |
| `Temporal.Duration` | `PT1H30M` | 가능 | `@MinDuration` / `@MaxDuration` 사용 | `'duration'` |

## 예시

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

다음 요청은 모든 필드를 바인딩합니다.

```json
{
    "checkIn": "2027-03-01",
    "length": { "hours": 2 },
    "holidays": ["2027-05-05"],
    "cancelAt": "2027-02-28T18:00+09:00[Asia/Seoul]"
}
```

`booking.checkIn`은 `Temporal.PlainDate`, `booking.length`는 `PT2H`인 `Temporal.Duration`이고, `booking.trial`은 기본값 `P7D`가 `Temporal.Duration`으로 들어갑니다.

## 값을 읽는 방법

- **문자열**은 어느 출처(body, query, params, header)에서 와도 `Temporal.X.from()`으로 읽습니다. Plain 타입(`PlainDate`, `PlainDateTime` 등)은 UTC offset이 붙은 문자열도 받고 offset을 버립니다(Temporal 기본 동작). 그래서 `2026-01-01T09:00+09:00`은 `PlainDate` `2026-01-01`이 됩니다. `Z`로 끝나는 문자열은 거부합니다.
- **객체**(`{ "year": 2026, "month": 3, "day": 1 }`)는 요청 본문에서만 읽고, `overflow: 'reject'`로 읽습니다. 그래서 `{ "month": 2, "day": 30 }`은 3월 2일이 되지 않고 실패합니다. `Instant`는 객체 형태가 없습니다.
- **달력**은 ISO 8601만 받습니다. `2026-01-01[u-ca=hebrew]`나 `{ "calendar": "hebrew", ... }`는 실패합니다.
- 같은 타입의 **인스턴스**는 그대로 둡니다. 숫자, 배열, 다른 Temporal 타입은 실패합니다.
- 읽을 수 없는 값은 `<필드> must be a valid <타입>` 오류를 냅니다. 예: `checkIn must be a valid PlainDate`.
- `@Default` 값도 요청 값처럼 변환합니다. 그래서 `@Default('P7D')`는 `Temporal.Duration`이 됩니다. 리스트 기본값은 요청마다 새 배열을 만듭니다.

## null을 허용하는 필드에는 `@Type`이 필요합니다

TypeScript는 `Temporal.PlainDate | null` 같은 유니온 타입을 `Object`로 기록하므로, express-cargo가 Temporal 타입을 알 수 없습니다. `@Type(() => Temporal.X)`를 붙이세요.

```typescript
class Request {
    @Body()
    @Optional()
    @Type(() => Temporal.PlainDate)
    dueDate!: Temporal.PlainDate | null
}
```

타입 별칭도 마찬가지입니다. 이런 필드에 `@Type` 없이 Temporal 검증자를 붙이거나, `@List` 없이 `@Each` 안에 붙이면 시작할 때 `CargoSchemaError`를 던집니다. 값이 문자열로 남아서 모든 요청이 실패하기 때문입니다.

## 검증자

### `@MinDate`와 `@MaxDate`

기준값은 필드와 같은 타입(`PlainDate` 필드라면 `Temporal.PlainDate`)이거나, 그런 값을 반환하는 함수여야 합니다.

```typescript
@Body()
@MinDate(Temporal.PlainTime.from('09:00'))
@MaxDate(Temporal.PlainTime.from('18:00'))
startsAt!: Temporal.PlainTime
```

- 기본 메시지는 `startsAt must be on or after 09:00:00` 형식입니다.
- 다른 타입의 고정 기준값(예: `PlainDate` 필드에 `PlainDateTime` 기준값)은 시작할 때 `CargoSchemaError`를 던집니다. 함수 기준값이 다른 타입을 반환하면 요청을 검증할 때 오류를 던지고 Express 기본 오류 처리기가 500으로 응답합니다.
- `PlainMonthDay`(순서가 없음)와 `Duration`에는 쓸 수 없습니다. `Duration`에는 `@MinDuration` / `@MaxDuration`을 쓰세요.

### `@MinDuration`과 `@MaxDuration`

`Temporal.Duration` 필드를 `Temporal.Duration` 또는 ISO 8601 문자열 기준값과 비교합니다.

```typescript
@Body()
@MinDuration('PT0S')
@MaxDuration('P1D')
timeout!: Temporal.Duration
```

- 하루는 24시간으로 봅니다. 그래서 `P1D`와 `PT24H`는 같습니다.
- 년·월·주는 길이가 일정하지 않아서 `P1M` 같은 기준값은 시작할 때 `CargoSchemaError`를 던집니다. 이런 단위로 들어온 값은 `<필드> must be given in days or smaller units, such as P7D, not in years, months or weeks` 오류를 냅니다.
- Duration은 음수일 수 있습니다. `@MaxDuration`만 붙인 필드는 `-PT1H`를 받으니, 막으려면 `@MinDuration('PT0S')`를 함께 쓰세요.

### `@Equal`, `@NotEqual`, `@OneOf`

`Date`는 시각으로, Temporal 값은 Temporal의 `equals()`로 값을 비교합니다. 그래서 같은 날의 `PlainDate` 두 개는 같습니다.

```typescript
@Body()
@OneOf([Temporal.PlainTime.from('09:00'), Temporal.PlainTime.from('15:00')])
slot!: Temporal.PlainTime
```

- 다른 타입의 값은 시작할 때 `CargoSchemaError`를 던집니다. 예를 들어 `PlainYearMonth` 필드에 `@Equal('2026-11')`을 쓰면 오류가 나니 `Temporal.PlainYearMonth.from('2026-11')`을 쓰세요.
- `ZonedDateTime`은 시간대까지 같아야 같은 값입니다. 그래서 `2026-01-01T09:00+09:00[Asia/Seoul]`과 `2026-01-01T00:00Z[UTC]`는 다릅니다.
- `Duration`은 모든 단위가 같아야 같은 값입니다. 그래서 `PT60M`과 `PT1H`는 다릅니다.

## 알아 둘 점

- **query 문자열의 `+`**는 공백이 됩니다. offset은 `%2B09:00`으로 보내세요.
- **서머타임**: `ZonedDateTime`에서 존재하지 않거나 두 번 나오는 현지 시각은 Temporal의 `disambiguation: 'compatible'` 방식으로 오류 없이 정해집니다.
- **윤초**: `23:59:60`은 `23:59:59`로 읽습니다.
- **`@Transform`**: `@Transform`이 붙은 필드는 transform이 반환한 값을 받습니다. 반복된 query 키에서 transform이 원소 하나를 고르면, 그 원소는 변환되지 않습니다.
- **세션 값**도 다른 출처와 같은 방식으로 변환합니다. 문자열은 바인딩되지만 JSON 세션 저장소에서 다시 읽은 객체는 실패합니다.
