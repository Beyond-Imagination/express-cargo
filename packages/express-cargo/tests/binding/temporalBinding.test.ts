import { bindingCargo, Body, CargoValidationError, getCargo, List, Optional, Query, Session, Type } from '../../src'
import { isTemporalSupported } from '../../src/dateLike'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'

// Runs only where Temporal is supported (Node.js 26+). Elsewhere the DTOs below fail the Temporal schema rule,
// which the schema rule tests cover.
const describeTemporal = isTemporalSupported() ? describe : describe.skip

describeTemporal('Temporal binding', () => {
    const T = () => (globalThis as any).Temporal

    function bind<D>(dto: new () => D, parts: { body?: unknown; query?: unknown; session?: unknown }) {
        const req = makeMockReq({
            body: parts.body ?? {},
            query: (parts.query ?? {}) as any,
            ...(parts.session ? { session: parts.session } : {}),
        } as any)
        const next = makeNext()
        bindingCargo(dto)(req, makeMockRes(), next)
        const error = next.mock.calls[0][0] as CargoValidationError | undefined
        return {
            dto: error ? undefined : getCargo<D>(req),
            errors: error ? error.errors.map(e => ({ field: String(e.field), message: e.message })) : [],
        }
    }

    describe('each Temporal type from a string', () => {
        let AllTypesDto: new () => any
        beforeAll(() => {
            class Dto {
                @Query() @Optional() instant?: Temporal.Instant
                @Query() @Optional() zoned?: Temporal.ZonedDateTime
                @Query() @Optional() dateTime?: Temporal.PlainDateTime
                @Query() @Optional() date?: Temporal.PlainDate
                @Query() @Optional() time?: Temporal.PlainTime
                @Query() @Optional() yearMonth?: Temporal.PlainYearMonth
                @Query() @Optional() monthDay?: Temporal.PlainMonthDay
                @Query() @Optional() duration?: Temporal.Duration
            }
            AllTypesDto = Dto
        })

        it.each([
            ['instant', '2026-01-01T00:00:00Z', 'Instant', '2026-01-01T00:00:00Z'],
            ['zoned', '2026-01-01T09:00+09:00[Asia/Seoul]', 'ZonedDateTime', '2026-01-01T09:00:00+09:00[Asia/Seoul]'],
            ['dateTime', '2026-01-01T09:00', 'PlainDateTime', '2026-01-01T09:00:00'],
            ['dateTime', '2026-01-01T09:00+09:00', 'PlainDateTime', '2026-01-01T09:00:00'],
            ['date', '2026-01-01', 'PlainDate', '2026-01-01'],
            ['date', '2026-01-01T09:00+09:00', 'PlainDate', '2026-01-01'],
            ['date', '20260101', 'PlainDate', '2026-01-01'],
            ['time', '09:30', 'PlainTime', '09:30:00'],
            ['time', '09:30+09:00', 'PlainTime', '09:30:00'],
            ['yearMonth', '2026-01', 'PlainYearMonth', '2026-01'],
            ['monthDay', '--02-29', 'PlainMonthDay', '02-29'],
            ['duration', 'PT1H30M', 'Duration', 'PT1H30M'],
            ['duration', '-P1D', 'Duration', '-P1D'],
        ])('binds %s from %s', (field, input, type, output) => {
            const { dto, errors } = bind(AllTypesDto, { query: { [field]: input } })
            expect(errors).toEqual([])
            expect(dto[field]).toBeInstanceOf(T()[type])
            expect(dto[field].toString()).toBe(output)
        })

        it.each([
            ['instant', '2026-01-01', 'Instant'],
            ['zoned', '2026-01-01T09:00+09:00', 'ZonedDateTime'],
            ['dateTime', '2026-01-01T09:00Z', 'PlainDateTime'],
            ['date', '2026-02-30', 'PlainDate'],
            ['date', '2026-01-01T09:00Z', 'PlainDate'],
            ['date', 'tomorrow', 'PlainDate'],
            ['time', '25:00', 'PlainTime'],
            ['yearMonth', '2026-13', 'PlainYearMonth'],
            ['monthDay', '--02-30', 'PlainMonthDay'],
            ['duration', '1h', 'Duration'],
        ])('rejects %s from %s', (field, input, type) => {
            const { errors } = bind(AllTypesDto, { query: { [field]: input } })
            expect(errors).toEqual([{ field, message: `${field} must be a valid ${type}` }])
        })

        it('rejects an array, such as a repeated query key', () => {
            const { errors } = bind(AllTypesDto, { query: { date: ['2026-01-01', '2026-01-02'] } })
            expect(errors).toEqual([{ field: 'date', message: 'date must be a valid PlainDate' }])
        })
    })

    describe('objects and other values', () => {
        let BodyDto: new () => any
        let QueryDto: new () => any
        beforeAll(() => {
            class BDto {
                @Body() @Optional() instant?: Temporal.Instant
                @Body() @Optional() zoned?: Temporal.ZonedDateTime
                @Body() @Optional() dateTime?: Temporal.PlainDateTime
                @Body() @Optional() date?: Temporal.PlainDate
                @Body() @Optional() time?: Temporal.PlainTime
                @Body() @Optional() yearMonth?: Temporal.PlainYearMonth
                @Body() @Optional() monthDay?: Temporal.PlainMonthDay
                @Body() @Optional() duration?: Temporal.Duration
            }
            class QDto {
                @Query() date!: Temporal.PlainDate
            }
            BodyDto = BDto
            QueryDto = QDto
        })

        it.each([
            ['zoned', { year: 2026, month: 1, day: 1, hour: 9, timeZone: 'Asia/Seoul' }, '2026-01-01T09:00:00+09:00[Asia/Seoul]'],
            ['dateTime', { year: 2026, month: 1, day: 1, hour: 9, minute: 30 }, '2026-01-01T09:30:00'],
            ['date', { year: 2026, month: 1, day: 5 }, '2026-01-05'],
            ['time', { hour: 9, minute: 30 }, '09:30:00'],
            ['yearMonth', { year: 2026, month: 1 }, '2026-01'],
            ['monthDay', { month: 2, day: 29 }, '02-29'],
            ['duration', { hours: 1, minutes: 30 }, 'PT1H30M'],
        ])('binds %s from a body object', (field, input, output) => {
            const { dto, errors } = bind(BodyDto, { body: { [field]: input } })
            expect(errors).toEqual([])
            expect(dto[field].toString()).toBe(output)
        })

        it.each([
            ['date', { year: 2026, month: 2, day: 30 }, 'PlainDate'],
            ['date', { year: 2026, month: 1 }, 'PlainDate'],
            ['yearMonth', { year: 2026, month: 13 }, 'PlainYearMonth'],
            ['instant', { epochMilliseconds: 0 }, 'Instant'],
            ['date', 20260101, 'PlainDate'],
            ['duration', 3600, 'Duration'],
            ['date', true, 'PlainDate'],
        ])('rejects %s from %j', (field, input, type) => {
            const { errors } = bind(BodyDto, { body: { [field]: input } })
            expect(errors).toEqual([{ field, message: `${field} must be a valid ${type}` }])
        })

        it('rejects an object outside the body', () => {
            const { errors } = bind(QueryDto, { query: { date: { year: 2026, month: 1, day: 1 } } })
            expect(errors).toEqual([{ field: 'date', message: 'date must be a valid PlainDate' }])
        })

        it('keeps an instance of the same type, such as one stored in the session', () => {
            class SessionDto {
                @Session() date!: Temporal.PlainDate
            }
            const date = T().PlainDate.from('2026-01-01')
            const { dto, errors } = bind(SessionDto, { session: { date } })
            expect(errors).toEqual([])
            expect(dto!.date).toBe(date)
        })

        it('rejects an instance of another Temporal type', () => {
            class SessionDto {
                @Session() date!: Temporal.PlainDate
            }
            const { errors } = bind(SessionDto, { session: { date: T().PlainDateTime.from('2026-01-01T09:00') } })
            expect(errors).toEqual([{ field: 'date', message: 'date must be a valid PlainDate' }])
        })
    })

    describe('calendars', () => {
        let CalendarDto: new () => any
        beforeAll(() => {
            class Dto {
                @Body() @Optional() date?: Temporal.PlainDate
                @Body() @Optional() zoned?: Temporal.ZonedDateTime
                @Body() @Optional() yearMonth?: Temporal.PlainYearMonth
                @Body() @Optional() monthDay?: Temporal.PlainMonthDay
                @Session() @Optional() stored?: Temporal.PlainDate
            }
            CalendarDto = Dto
        })

        it.each([
            ['date', '2026-01-01[u-ca=iso8601]', '2026-01-01'],
            ['date', { year: 2026, month: 1, day: 1, calendar: 'iso8601' }, '2026-01-01'],
        ])('binds %s in the ISO calendar from %j', (field, input, output) => {
            const { dto, errors } = bind(CalendarDto, { body: { [field]: input } })
            expect(errors).toEqual([])
            expect(dto[field].toString()).toBe(output)
        })

        it.each([
            ['date', '2026-01-01[u-ca=hebrew]', 'PlainDate'],
            ['date', '2026-01-01[u-ca=gregory]', 'PlainDate'],
            ['date', { year: 5786, month: 1, day: 1, calendar: 'hebrew' }, 'PlainDate'],
            ['zoned', '2026-01-01T00:00+09:00[Asia/Seoul][u-ca=hebrew]', 'ZonedDateTime'],
            ['yearMonth', '2026-01-01[u-ca=hebrew]', 'PlainYearMonth'],
            ['monthDay', '2026-01-01[u-ca=gregory]', 'PlainMonthDay'],
        ])('rejects %s in another calendar from %j', (field, input, type) => {
            const { errors } = bind(CalendarDto, { body: { [field]: input } })
            expect(errors).toEqual([{ field, message: `${field} must be a valid ${type}` }])
        })

        it('rejects an instance in another calendar', () => {
            const { errors } = bind(CalendarDto, { session: { stored: T().PlainDate.from('2026-01-01[u-ca=hebrew]') } })
            expect(errors).toEqual([{ field: 'stored', message: 'stored must be a valid PlainDate' }])
        })
    })

    describe('declarations that previously misbehaved', () => {
        class Schedule {
            @Body() due!: Temporal.PlainDate
        }

        it('binds a string through @Type(() => Temporal.PlainDate)', () => {
            class TypeDto {
                @Body() @Type(() => T().PlainDate) due!: Temporal.PlainDate
            }
            const { dto, errors } = bind(TypeDto, { body: { due: '2026-01-01' } })
            expect(errors).toEqual([])
            expect(dto!.due.toString()).toBe('2026-01-01')
        })

        it('binds list elements by constructor and by type name, reporting each element by index', () => {
            class ListDto {
                @Body() @List(T().PlainDate) byType!: Temporal.PlainDate[]
                @Body() @List('plainDate') byName!: Temporal.PlainDate[]
            }
            const ok = bind(ListDto, { body: { byType: ['2026-01-01'], byName: ['2026-01-02'] } })
            expect(ok.errors).toEqual([])
            expect(ok.dto!.byType[0]).toBeInstanceOf(T().PlainDate)
            expect(ok.dto!.byName[0].toString()).toBe('2026-01-02')

            const bad = bind(ListDto, { body: { byType: ['2026-01-01', 'x'], byName: ['2026-02-30'] } })
            expect(bad.errors).toEqual([
                { field: 'byType[1]', message: 'byType[1] must be a valid PlainDate' },
                { field: 'byName[0]', message: 'byName[0] must be a valid PlainDate' },
            ])
        })

        it('binds body objects inside a nested DTO and as list elements', () => {
            class Slot {
                @Body() start!: Temporal.PlainTime
            }
            class AgendaDto {
                @Body() @Type(() => Slot) first!: Slot
                @Body() @List(T().PlainDate) days!: Temporal.PlainDate[]
            }
            const { dto, errors } = bind(AgendaDto, {
                body: { first: { start: { hour: 9, minute: 30 } }, days: [{ year: 2026, month: 1, day: 1 }, '2026-01-02'] },
            })
            expect(errors).toEqual([])
            expect(dto!.first.start.toString()).toBe('09:30:00')
            expect(dto!.days.map((day: object) => day.toString())).toEqual(['2026-01-01', '2026-01-02'])
        })

        it('reports a field inside a nested DTO under its full path', () => {
            class PlanDto {
                @Body() @Type(() => Schedule) schedule!: Schedule
            }
            const ok = bind(PlanDto, { body: { schedule: { due: '2026-01-01' } } })
            expect(ok.dto!.schedule.due.toString()).toBe('2026-01-01')

            const bad = bind(PlanDto, { body: { schedule: { due: '2026-02-30' } } })
            expect(bad.errors).toEqual([{ field: 'schedule.due', message: 'due must be a valid PlainDate' }])
        })
    })
})
