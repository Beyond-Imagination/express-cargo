---
id: temporal
title: Temporal
---

En Node.js 26 o superior, express-cargo enlaza los valores de la solicitud con los tipos integrados de [`Temporal`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal), y los validadores de fechas los aceptan. Los campos `Date` siguen funcionando en todas las versiones de Node.js compatibles.

## Requisitos

| Entorno de ejecución | `Date` | `Temporal` |
|---|---|---|
| Node.js 20, 22, 24 | Compatible | No compatible |
| Node.js 24 con `--harmony-temporal` | Compatible | No compatible (flag experimental) |
| Node.js 26 o superior | Compatible | Compatible |

- Solo se admite el `Temporal` integrado en Node.js. Un polyfill como `@js-temporal/polyfill` no es compatible.
- En Node.js 24, `--harmony-temporal` activa un `Temporal` experimental, pero express-cargo trata ese entorno como no compatible.
- En un entorno sin soporte, un DTO que declare un campo Temporal, `@List('plainDate')`, `@Type(() => Temporal.X)`, `@MinDuration` o `@MaxDuration` lanza un `CargoSchemaError` al llamar a `bindingCargo()`, de modo que la aplicación se detiene en el arranque.
- TypeScript incluye los tipos de Temporal desde la versión 6.0. Inclúyelos con `"lib": ["ESNext"]` (o `"esnext.temporal"`) en `tsconfig.json`.

## Tipos compatibles

| Tipo | Ejemplo de cadena | Objeto en el cuerpo | Ordenado por `@MinDate` / `@MaxDate` | Nombre en `@List` |
|---|---|---|---|---|
| `Temporal.Instant` | `2026-01-01T00:00:00Z` | No | Sí | `'instant'` |
| `Temporal.ZonedDateTime` | `2026-01-01T09:00+09:00[Asia/Seoul]` | Sí | Sí | `'zonedDateTime'` |
| `Temporal.PlainDateTime` | `2026-01-01T09:00` | Sí | Sí | `'plainDateTime'` |
| `Temporal.PlainDate` | `2026-01-01` | Sí | Sí | `'plainDate'` |
| `Temporal.PlainTime` | `09:00` | Sí | Sí | `'plainTime'` |
| `Temporal.PlainYearMonth` | `2026-01` | Sí | Sí | `'plainYearMonth'` |
| `Temporal.PlainMonthDay` | `01-01` | Sí | No | `'plainMonthDay'` |
| `Temporal.Duration` | `PT1H30M` | Sí | Usa `@MinDuration` / `@MaxDuration` | `'duration'` |

## Ejemplo

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

Esta solicitud enlaza todos los campos:

```json
{
    "checkIn": "2027-03-01",
    "length": { "hours": 2 },
    "holidays": ["2027-05-05"],
    "cancelAt": "2027-02-28T18:00+09:00[Asia/Seoul]"
}
```

`booking.checkIn` es un `Temporal.PlainDate`, `booking.length` es el `Temporal.Duration` `PT2H`, y `booking.trial` es el valor predeterminado `P7D` como `Temporal.Duration`.

## Cómo se leen los valores

- **Las cadenas** de cualquier fuente (cuerpo, query, params, encabezados) se analizan con `Temporal.X.from()`. Los tipos Plain (`PlainDate`, `PlainDateTime`, etc.) aceptan una cadena con desfase UTC y lo descartan, como hace Temporal, por lo que `2026-01-01T09:00+09:00` se enlaza al `PlainDate` `2026-01-01`. Una cadena que termina en `Z` se rechaza para ellos.
- **Los objetos** como `{ "year": 2026, "month": 3, "day": 1 }` se leen solo desde el cuerpo de la solicitud, con `overflow: 'reject'`, así que `{ "month": 2, "day": 30 }` falla en lugar de convertirse en el 2 de marzo. `Instant` no tiene forma de objeto.
- **Calendarios**: solo se enlaza el calendario ISO 8601. Un valor como `2026-01-01[u-ca=hebrew]` o `{ "calendar": "hebrew", ... }` falla.
- **Las instancias** del mismo tipo se conservan tal cual. Los números, los arrays y otros tipos Temporal fallan.
- Un valor que no puede leerse falla con `<field> must be a valid <Type>`, como `checkIn must be a valid PlainDate`.
- Los valores de `@Default` se convierten igual que los valores de la solicitud, así que `@Default('P7D')` produce un `Temporal.Duration`. Un valor predeterminado de lista recibe un array nuevo en cada solicitud.

## Los campos anulables necesitan `@Type`

TypeScript registra una unión como `Temporal.PlainDate | null` como `Object`, por lo que express-cargo no puede ver el tipo Temporal. Añade `@Type(() => Temporal.X)`:

```typescript
class Request {
    @Body()
    @Optional()
    @Type(() => Temporal.PlainDate)
    dueDate!: Temporal.PlainDate | null
}
```

Lo mismo ocurre con un alias de tipo. Un validador Temporal en un campo así sin `@Type`, o dentro de `@Each` sin `@List`, lanza un `CargoSchemaError` en el arranque, ya que el valor seguiría siendo una cadena y fallaría en todas las solicitudes.

## Validadores

### `@MinDate` y `@MaxDate`

El límite debe ser del mismo tipo que el campo, como un `Temporal.PlainDate` en un campo `PlainDate`, o una función que devuelva uno:

```typescript
@Body()
@MinDate(Temporal.PlainTime.from('09:00'))
@MaxDate(Temporal.PlainTime.from('18:00'))
startsAt!: Temporal.PlainTime
```

- El mensaje predeterminado es `startsAt must be on or after 09:00:00`.
- Un límite fijo de otro tipo, como un límite `PlainDateTime` en un campo `PlainDate`, lanza un `CargoSchemaError` en el arranque. Un límite dado por una función que devuelve otro tipo lanza el error cuando se valida la solicitud, y el manejador de errores predeterminado de Express responde con un 500.
- No se pueden usar en `PlainMonthDay`, que no tiene orden, ni en `Duration`; usa `@MinDuration` / `@MaxDuration` en su lugar.

### `@MinDuration` y `@MaxDuration`

Comprueban un campo `Temporal.Duration` frente a un límite dado como `Temporal.Duration` o como cadena ISO 8601:

```typescript
@Body()
@MinDuration('PT0S')
@MaxDuration('P1D')
timeout!: Temporal.Duration
```

- Un día cuenta como 24 horas, así que `P1D` equivale a `PT24H`.
- Los años, los meses y las semanas no tienen una duración fija, por lo que un límite como `P1M` lanza un `CargoSchemaError` en el arranque. Un valor en esas unidades falla con `<field> must be given in days or smaller units, such as P7D, not in years, months or weeks`.
- Las duraciones pueden ser negativas. Un campo con solo `@MaxDuration` acepta `-PT1H`; añade `@MinDuration('PT0S')` para rechazarlo.

### `@Equal`, `@NotEqual` y `@OneOf`

Los `Date` se comparan por su instante y los valores Temporal con el `equals()` de Temporal, así que dos `PlainDate` del mismo día son iguales:

```typescript
@Body()
@OneOf([Temporal.PlainTime.from('09:00'), Temporal.PlainTime.from('15:00')])
slot!: Temporal.PlainTime
```

- Un valor de otro tipo lanza un `CargoSchemaError` en el arranque, como `@Equal('2026-11')` en un `PlainYearMonth`; usa `Temporal.PlainYearMonth.from('2026-11')`.
- Los valores `ZonedDateTime` son iguales solo cuando la zona horaria también coincide, así que `2026-01-01T09:00+09:00[Asia/Seoul]` y `2026-01-01T00:00Z[UTC]` son distintos.
- Los valores `Duration` son iguales solo cuando coinciden todas las unidades, así que `PT60M` y `PT1H` son distintos.

## Cosas que conviene saber

- **`+` en una cadena de consulta** se convierte en un espacio. Envía un desfase como `%2B09:00`.
- **Horario de verano**: una hora local que no existe o que ocurre dos veces en un `ZonedDateTime` se resuelve como lo hace `disambiguation: 'compatible'` de Temporal, sin error.
- **Segundos intercalares**: `23:59:60` se lee como `23:59:59`.
- **`@Transform`**: un campo con `@Transform` recibe el valor que devuelve la transformación. Si la transformación elige un elemento de una clave de query repetida, ese elemento no se convierte.
- **Los valores de sesión** pasan por la misma conversión que las demás fuentes: una cadena se enlaza, mientras que un objeto leído de un almacén de sesión JSON falla.
