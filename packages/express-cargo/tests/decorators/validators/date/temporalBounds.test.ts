import {
    bindingCargo,
    Body,
    CargoFieldError,
    CargoValidationError,
    Default,
    Each,
    Equal,
    getCargo,
    List,
    MaxDate,
    MaxDuration,
    MinDate,
    MinDuration,
    NotEqual,
    OneOf,
    Type,
} from '../../../../src'
import { isTemporalSupported } from '../../../../src/dateLike'
import { CargoClassMetadata } from '../../../../src/metadata'
import { makeMockReq, makeMockRes, makeNext } from '../../../binding/testUtils'

const describeTemporal = isTemporalSupported() ? describe : describe.skip

describeTemporal('date and duration bounds with Temporal values', () => {
    const T = () => (globalThis as any).Temporal

    /** The validator a decorator registers, applied to a throwaway class. */
    function ruleOf(decorator: PropertyDecorator, type: string) {
        class Holder {}
        decorator(Holder.prototype, 'field')
        return new CargoClassMetadata(Holder.prototype)
            .getFieldMetadata('field')
            .getValidators()!
            .find(v => v.type === type)!
    }
    const fails = (rule: ReturnType<typeof ruleOf>, value: unknown) => rule.validate(value) instanceof CargoFieldError
    const messageOf = (rule: ReturnType<typeof ruleOf>, value: unknown) => rule.validate(value)?.message

    describe('MinDate and MaxDate', () => {
        it.each([
            ['Instant', '2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z'],
            ['ZonedDateTime', '2026-01-01T00:00+09:00[Asia/Seoul]', '2026-01-02T00:00+09:00[Asia/Seoul]'],
            ['PlainDateTime', '2026-01-01T09:00', '2026-01-01T10:00'],
            ['PlainDate', '2026-01-01', '2026-01-02'],
            ['PlainTime', '09:00', '10:00'],
            ['PlainYearMonth', '2026-01', '2026-02'],
        ])('orders Temporal.%s values against a bound of the same type', (type, earlier, later) => {
            const from = (s: string) => T()[type].from(s)
            const min = ruleOf(MinDate(from(later) as any) as PropertyDecorator, 'minDate')
            const max = ruleOf(MaxDate(from(earlier) as any) as PropertyDecorator, 'maxDate')

            expect(fails(min, from(later))).toBe(false)
            expect(fails(min, from(earlier))).toBe(true)
            expect(fails(max, from(earlier))).toBe(false)
            expect(fails(max, from(later))).toBe(true)
        })

        it('takes a function bound and reports it as an ISO string', () => {
            const rule = ruleOf(MinDate(() => T().PlainDate.from('2026-03-01')) as PropertyDecorator, 'minDate')
            expect(messageOf(rule, T().PlainDate.from('2026-02-28'))).toBe('field must be on or after 2026-03-01')
        })

        it('treats a bound that cannot be compared with a valid date as a setup error, never converting', () => {
            const plainDateMin = ruleOf(MinDate(T().PlainDate.from('2026-01-01')) as PropertyDecorator, 'minDate')
            expect(() => plainDateMin.validate(T().PlainDateTime.from('2026-06-01T00:00'))).toThrow(
                '@MinDate bound 2026-01-01 (Temporal.PlainDate) cannot be compared with a Temporal.PlainDateTime value',
            )
            expect(() => plainDateMin.validate(new Date('2026-06-01'))).toThrow('cannot be compared with a Date value')

            const dateMin = ruleOf(MinDate(new Date('2026-01-01')) as PropertyDecorator, 'minDate')
            expect(() => dateMin.validate(T().PlainDate.from('2026-06-01'))).toThrow('cannot be compared with a Temporal.PlainDate value')

            const invalidMax = ruleOf(MaxDate(() => new Date('not a date')) as PropertyDecorator, 'maxDate')
            expect(() => invalidMax.validate(new Date('2026-06-01'))).toThrow('@MaxDate bound Invalid Date cannot be compared with a Date value')
        })

        it('fails validation, without a setup error, when a function bound returns no date', () => {
            const rule = ruleOf(MinDate(() => undefined as any) as PropertyDecorator, 'minDate')
            expect(fails(rule, T().PlainDate.from('2026-06-01'))).toBe(true)
            expect(fails(ruleOf(MaxDate(() => null as any) as PropertyDecorator, 'maxDate'), new Date('2026-06-01'))).toBe(true)
        })

        it('still fails a value that is not a date, as before', () => {
            const rule = ruleOf(MinDate(T().PlainDate.from('2026-01-01')) as PropertyDecorator, 'minDate')
            expect(fails(rule, '2026-06-01')).toBe(true)
        })
    })

    describe('MinDuration and MaxDuration', () => {
        const d = (s: string) => T().Duration.from(s)

        it('takes the bound as a string or a Duration', () => {
            for (const bound of ['PT5M', d('PT5M')]) {
                const rule = ruleOf(MinDuration(bound as any) as PropertyDecorator, 'minDuration')
                expect(fails(rule, d('PT5M'))).toBe(false)
                expect(fails(rule, d('PT4M59S'))).toBe(true)
            }
            const max = ruleOf(MaxDuration('PT2H') as PropertyDecorator, 'maxDuration')
            expect(fails(max, d('PT1H30M'))).toBe(false)
            expect(fails(max, d('P1D'))).toBe(true)
        })

        it('reports the bound in its default message, or uses a custom message', () => {
            expect(messageOf(ruleOf(MinDuration('PT5M') as PropertyDecorator, 'minDuration'), d('PT1M'))).toBe('field must be at least PT5M')
            expect(messageOf(ruleOf(MaxDuration('PT2H') as PropertyDecorator, 'maxDuration'), d('PT3H'))).toBe('field must be at most PT2H')
            expect(messageOf(ruleOf(MinDuration('PT5M', 'too short') as PropertyDecorator, 'minDuration'), d('PT1M'))).toBe('too short')
        })

        it('asks for days or smaller units when the value has years, months or weeks', () => {
            const rule = ruleOf(MaxDuration('P30D') as PropertyDecorator, 'maxDuration')
            for (const value of ['P1M', 'P1W', 'P1Y']) {
                expect(messageOf(rule, d(value))).toBe('field must be given in days or smaller units, such as P7D, not in years, months or weeks')
            }
        })

        it('treats a day as 24 hours', () => {
            const rule = ruleOf(MaxDuration('PT24H') as PropertyDecorator, 'maxDuration')
            expect(fails(rule, d('P1D'))).toBe(false)
        })

        it('fails values that are not durations, with a message about the bound', () => {
            const rule = ruleOf(MinDuration('PT5M') as PropertyDecorator, 'minDuration')
            expect(messageOf(rule, 'PT10M')).toBe('field must be at least PT5M')
            expect(fails(rule, T().PlainTime.from('00:10'))).toBe(true)
        })
    })

    describe('during binding', () => {
        function errorsOf(dto: new () => unknown, body: unknown) {
            const next = makeNext()
            bindingCargo(dto)(makeMockReq({ body } as any), makeMockRes(), next)
            const error = next.mock.calls[0][0] as CargoValidationError | undefined
            return error ? error.errors.map(e => ({ field: String(e.field), message: e.message })) : []
        }

        it('validates bound Temporal fields and list elements', () => {
            class BookingDto {
                @Body() @MinDate(() => T().PlainDate.from('2026-01-01')) checkIn!: Temporal.PlainDate
                @Body() @MaxDuration('PT2H') length!: Temporal.Duration
                @Body() @List('plainDate') @Each(MaxDate(T().PlainDate.from('2026-12-31'))) holidays!: Temporal.PlainDate[]
            }

            expect(errorsOf(BookingDto, { checkIn: '2026-03-01', length: 'PT1H', holidays: ['2026-05-05'] })).toEqual([])
            expect(errorsOf(BookingDto, { checkIn: '2025-12-31', length: { hours: 3 }, holidays: ['2026-05-05', '2027-01-01'] })).toEqual([
                { field: 'checkIn', message: 'checkIn must be on or after 2026-01-01' },
                { field: 'length', message: 'length must be at most PT2H' },
                { field: 'holidays[1]', message: 'holidays must be on or before 2026-12-31' },
            ])
        })

        it('reports a duration in years, months or weeks from each duration validator, like any failing validator', () => {
            class StayDto {
                @Body() @MinDuration('P1D') @MaxDuration('P30D') stay!: Temporal.Duration
            }
            const units = { field: 'stay', message: 'stay must be given in days or smaller units, such as P7D, not in years, months or weeks' }

            expect(errorsOf(StayDto, { stay: 'P1W' })).toEqual([units, units])
            expect(errorsOf(StayDto, { stay: 'P7D' })).toEqual([])
        })

        it('reports a value in years, months or weeks per list element under @Each', () => {
            class ListDto {
                @Body() @List('duration') @Each(MinDuration('PT1M'), MaxDuration('PT48H')) spans!: Temporal.Duration[]
            }
            const units = { field: 'spans[1]', message: 'spans must be given in days or smaller units, such as P7D, not in years, months or weeks' }

            expect(errorsOf(ListDto, { spans: ['PT1H', 'P1W'] })).toEqual([units, units])
        })

        it('casts a string default like a request value', () => {
            class TrialDto {
                @Body() @Default('P7D') trial!: Temporal.Duration
            }
            const req = makeMockReq({ body: {} } as any)
            const next = makeNext()
            bindingCargo(TrialDto)(req, makeMockRes(), next)

            expect(next).toHaveBeenCalledWith()
            expect(getCargo<TrialDto>(req)!.trial).toBeInstanceOf(T().Duration)
            expect(String(getCargo<TrialDto>(req)!.trial)).toBe('P7D')
        })

        it('casts defaults of nullable @Type fields and list defaults, and keeps a null default', () => {
            class DefaultsDto {
                @Body() @Type(() => T().Duration) @Default('P7D') trial!: Temporal.Duration | null
                @Body() @List('plainDate') @Default(['2026-01-01']) days!: Temporal.PlainDate[]
                @Body() @Default(null) cancelAt?: Temporal.PlainDate
            }
            const req = makeMockReq({ body: {} } as any)
            const next = makeNext()
            bindingCargo(DefaultsDto)(req, makeMockRes(), next)

            expect(next).toHaveBeenCalledWith()
            const dto = getCargo<DefaultsDto>(req)!
            expect(dto.trial).toBeInstanceOf(T().Duration)
            expect(dto.days[0]).toBeInstanceOf(T().PlainDate)
            expect(dto.cancelAt).toBeNull()
        })

        it('reports a value in years, months or weeks with the units message, even with custom messages', () => {
            class CustomDto {
                @Body() @MinDuration('PT1H', 'too short') @MaxDuration('P10D', 'too long') both!: Temporal.Duration
                @Body() @MinDuration('PT1H') @MaxDuration('P10D', 'too long') maxOnly!: Temporal.Duration
            }
            const units = 'must be given in days or smaller units, such as P7D, not in years, months or weeks'

            expect(errorsOf(CustomDto, { both: 'P1W', maxOnly: 'P1W' })).toEqual([
                { field: 'both', message: `both ${units}` },
                { field: 'both', message: `both ${units}` },
                { field: 'maxOnly', message: `maxOnly ${units}` },
                { field: 'maxOnly', message: `maxOnly ${units}` },
            ])
            expect(errorsOf(CustomDto, { both: 'PT5M', maxOnly: 'P11D' })).toEqual([
                { field: 'both', message: 'too short' },
                { field: 'maxOnly', message: 'too long' },
            ])
        })

        it('compares dates and Temporal values by value in Equal, NotEqual and OneOf', () => {
            class SlotDto {
                @Body() @Equal(T().PlainDate.from('2026-01-01')) day!: Temporal.PlainDate
                @Body() @NotEqual(T().PlainTime.from('12:00')) start!: Temporal.PlainTime
                @Body() @OneOf([T().PlainTime.from('09:00'), T().PlainTime.from('15:00')]) end!: Temporal.PlainTime
            }

            expect(errorsOf(SlotDto, { day: '2026-01-01', start: '09:00', end: '15:00' })).toEqual([])
            expect(errorsOf(SlotDto, { day: '2026-01-02', start: '12:00', end: '15:00:01' }).map(e => e.field)).toEqual(['day', 'start', 'end'])
        })
    })
})
