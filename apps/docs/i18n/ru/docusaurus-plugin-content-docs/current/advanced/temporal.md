---
id: temporal
title: Temporal
---

В Node.js 26 и новее express-cargo привязывает значения запроса к встроенным типам [`Temporal`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal), а валидаторы дат принимают эти типы. Поля `Date` продолжают работать во всех поддерживаемых версиях Node.js.

## Требования

| Среда выполнения | `Date` | `Temporal` |
|---|---|---|
| Node.js 20, 22, 24 | Поддерживается | Не поддерживается |
| Node.js 24 с `--harmony-temporal` | Поддерживается | Не поддерживается (экспериментальный флаг) |
| Node.js 26 и новее | Поддерживается | Поддерживается |

- Поддерживается только `Temporal`, встроенный в Node.js. Полифилл, например `@js-temporal/polyfill`, не поддерживается.
- В Node.js 24 флаг `--harmony-temporal` включает экспериментальный `Temporal`, но express-cargo считает такую среду неподдерживаемой.
- В среде выполнения без поддержки DTO, в котором объявлено поле типа Temporal, `@List('plainDate')`, `@Type(() => Temporal.X)`, `@MinDuration` или `@MaxDuration`, выбрасывает `CargoSchemaError` при вызове `bindingCargo()`, поэтому приложение останавливается при запуске.
- TypeScript поставляет типы Temporal начиная с версии 6.0. Подключите их с помощью `"lib": ["ESNext"]` (или `"esnext.temporal"`) в `tsconfig.json`.

## Поддерживаемые типы

| Тип | Пример строки | Объект в теле запроса | Упорядочивается `@MinDate` / `@MaxDate` | Имя для `@List` |
|---|---|---|---|---|
| `Temporal.Instant` | `2026-01-01T00:00:00Z` | Нет | Да | `'instant'` |
| `Temporal.ZonedDateTime` | `2026-01-01T09:00+09:00[Asia/Seoul]` | Да | Да | `'zonedDateTime'` |
| `Temporal.PlainDateTime` | `2026-01-01T09:00` | Да | Да | `'plainDateTime'` |
| `Temporal.PlainDate` | `2026-01-01` | Да | Да | `'plainDate'` |
| `Temporal.PlainTime` | `09:00` | Да | Да | `'plainTime'` |
| `Temporal.PlainYearMonth` | `2026-01` | Да | Да | `'plainYearMonth'` |
| `Temporal.PlainMonthDay` | `01-01` | Да | Нет | `'plainMonthDay'` |
| `Temporal.Duration` | `PT1H30M` | Да | Используйте `@MinDuration` / `@MaxDuration` | `'duration'` |

## Пример

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

Этот запрос привязывает все поля:

```json
{
    "checkIn": "2027-03-01",
    "length": { "hours": 2 },
    "holidays": ["2027-05-05"],
    "cancelAt": "2027-02-28T18:00+09:00[Asia/Seoul]"
}
```

`booking.checkIn` является `Temporal.PlainDate`, `booking.length` является `Temporal.Duration` со значением `PT2H`, а `booking.trial` является значением по умолчанию `P7D` в виде `Temporal.Duration`.

## Как читаются значения

- **Строки** из любого источника (body, query, params, headers) разбираются с помощью `Temporal.X.from()`. Plain-типы (`PlainDate`, `PlainDateTime` и т. д.) принимают строку со смещением UTC и отбрасывают смещение, как это делает Temporal, поэтому `2026-01-01T09:00+09:00` привязывается к `PlainDate` `2026-01-01`. Строка, оканчивающаяся на `Z`, для них отклоняется.
- **Объекты**, например `{ "year": 2026, "month": 3, "day": 1 }`, читаются только из тела запроса с параметром `overflow: 'reject'`, поэтому `{ "month": 2, "day": 30 }` приводит к ошибке, а не превращается в 2 марта. У `Instant` формы объекта нет.
- **Календари**: привязывается только календарь ISO 8601. Значение вроде `2026-01-01[u-ca=hebrew]` или `{ "calendar": "hebrew", ... }` приводит к ошибке.
- **Экземпляры** того же типа сохраняются как есть. Числа, массивы и другие типы Temporal приводят к ошибке.
- Значение, которое невозможно прочитать, приводит к ошибке `<field> must be a valid <Type>`, например `checkIn must be a valid PlainDate`.
- Значения `@Default` приводятся так же, как значения запроса, поэтому `@Default('P7D')` даёт `Temporal.Duration`. Для списка по умолчанию при каждом запросе создаётся новый массив.

## Поля, допускающие null, требуют `@Type`

TypeScript записывает объединение вроде `Temporal.PlainDate | null` как `Object`, поэтому express-cargo не видит тип Temporal. Добавьте `@Type(() => Temporal.X)`:

```typescript
class Request {
    @Body()
    @Optional()
    @Type(() => Temporal.PlainDate)
    dueDate!: Temporal.PlainDate | null
}
```

То же относится к псевдониму типа. Валидатор Temporal на таком поле без `@Type`, а также внутри `@Each` без `@List`, выбрасывает `CargoSchemaError` при запуске, так как значение осталось бы строкой и не проходило бы проверку в каждом запросе.

## Валидаторы

### `@MinDate` и `@MaxDate`

Граница должна иметь тот же тип, что и поле, например `Temporal.PlainDate` для поля `PlainDate`, либо быть функцией, возвращающей такое значение:

```typescript
@Body()
@MinDate(Temporal.PlainTime.from('09:00'))
@MaxDate(Temporal.PlainTime.from('18:00'))
startsAt!: Temporal.PlainTime
```

- Сообщение по умолчанию выглядит так: `startsAt must be on or after 09:00:00`.
- Фиксированная граница другого типа, например граница `PlainDateTime` для поля `PlainDate`, выбрасывает `CargoSchemaError` при запуске. Граница-функция, возвращающая значение другого типа, выбрасывает ошибку при валидации запроса, и стандартный обработчик ошибок Express отвечает на неё кодом 500.
- Их нельзя использовать с `PlainMonthDay`, у которого нет порядка, и с `Duration`; для них используйте `@MinDuration` / `@MaxDuration`.

### `@MinDuration` и `@MaxDuration`

Они проверяют поле `Temporal.Duration` относительно границы, заданной как `Temporal.Duration` или строка ISO 8601:

```typescript
@Body()
@MinDuration('PT0S')
@MaxDuration('P1D')
timeout!: Temporal.Duration
```

- Сутки считаются равными 24 часам, поэтому `P1D` равно `PT24H`.
- У лет, месяцев и недель нет фиксированной длины, поэтому граница вроде `P1M` выбрасывает `CargoSchemaError` при запуске. Значение в этих единицах приводит к ошибке `<field> must be given in days or smaller units, such as P7D, not in years, months or weeks`.
- Длительности могут быть отрицательными. Поле только с `@MaxDuration` принимает `-PT1H`; добавьте `@MinDuration('PT0S')`, чтобы отклонять такие значения.

### `@Equal`, `@NotEqual` и `@OneOf`

Значения `Date` сравниваются по времени, а значения Temporal — с помощью `equals()` из Temporal, поэтому два `PlainDate` для одного и того же дня равны:

```typescript
@Body()
@OneOf([Temporal.PlainTime.from('09:00'), Temporal.PlainTime.from('15:00')])
slot!: Temporal.PlainTime
```

- Значение другого типа выбрасывает `CargoSchemaError` при запуске, например `@Equal('2026-11')` для `PlainYearMonth`; используйте `Temporal.PlainYearMonth.from('2026-11')`.
- Значения `ZonedDateTime` равны, только если совпадает и часовой пояс, поэтому `2026-01-01T09:00+09:00[Asia/Seoul]` и `2026-01-01T00:00Z[UTC]` различаются.
- Значения `Duration` равны, только если совпадают все единицы, поэтому `PT60M` и `PT1H` различаются.

## Что нужно знать

- **Символ `+` в строке запроса** превращается в пробел. Передавайте смещение как `%2B09:00`.
- **Летнее время**: локальное время, которого не существует или которое встречается дважды в `ZonedDateTime`, разрешается так же, как при `disambiguation: 'compatible'` в Temporal, без ошибки.
- **Високосные секунды**: `23:59:60` читается как `23:59:59`.
- **`@Transform`**: поле с `@Transform` получает значение, которое вернула трансформация. Если трансформация выбирает элемент из повторяющегося ключа запроса, этот элемент не приводится.
- **Значения сессии** проходят то же приведение, что и значения из других источников: строка привязывается, а объект, прочитанный из JSON-хранилища сессий, приводит к ошибке.
