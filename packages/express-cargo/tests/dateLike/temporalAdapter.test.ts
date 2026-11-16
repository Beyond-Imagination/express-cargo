import { adapterForType, adapterForValue, compareDateLike, INVALID_CAST, isTemporalSupported } from '../../src/dateLike'
import { isDeepEqual, isUserDefinedClass } from '../../src/utils'
import { List } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

const describeTemporal = isTemporalSupported() ? describe : describe.skip

describeTemporal('Temporal adapter', () => {
    const T = () => (globalThis as any).Temporal
    const date = (s: string) => T().PlainDate.from(s)

    it('is registered for all eight Temporal types, which stay leaves', () => {
        const adapter = adapterForType(T().PlainDate)
        expect(adapter).toBeDefined()
        for (const name of ['Instant', 'ZonedDateTime', 'PlainDateTime', 'PlainDate', 'PlainTime', 'PlainYearMonth', 'PlainMonthDay', 'Duration']) {
            expect(adapterForType(T()[name])).toBe(adapter)
            expect(isUserDefinedClass(T()[name])).toBe(false)
        }
        expect(adapterForValue(date('2026-01-01'))).toBe(adapter)
        expect(adapterForType(Date)).not.toBe(adapter)
    })

    it('reports a cast failure without throwing', () => {
        const adapter = adapterForType(T().PlainDate)!
        expect(adapter.cast(T().PlainDate, '2026-02-30', 'query')).toBe(INVALID_CAST)
        expect(adapter.cast(T().PlainDate, { year: 2026, month: 1, day: 1 }, 'query')).toBe(INVALID_CAST)
        expect(adapter.invalidMessage(T().ZonedDateTime)).toBe('must be a valid ZonedDateTime')
    })

    it('orders values of the same type only', () => {
        expect(compareDateLike(date('2026-01-01'), date('2026-01-02'))).toBe(-1)
        expect(compareDateLike(date('2026-01-02'), date('2026-01-01'))).toBe(1)
        expect(compareDateLike(date('2026-01-01'), date('2026-01-01'))).toBe(0)
        // Temporal's own compare() would convert these and answer 0.
        expect(compareDateLike(date('2026-01-01'), T().PlainDateTime.from('2026-01-01T00:00'))).toBeUndefined()
        expect(compareDateLike(date('2026-01-01'), new Date('2026-01-01'))).toBeUndefined()
        expect(compareDateLike(T().PlainMonthDay.from('--01-01'), T().PlainMonthDay.from('--01-02'))).toBeUndefined()
        expect(compareDateLike(T().Duration.from('PT1H'), T().Duration.from('PT2H'))).toBeUndefined()
    })

    it('compares Temporal values by value in deep equality', () => {
        expect(isDeepEqual(date('2026-01-01'), date('2026-01-01'))).toBe(true)
        expect(isDeepEqual(date('2026-01-01'), date('2026-01-02'))).toBe(false)
        expect(isDeepEqual({ at: [date('2026-01-01')] }, { at: [date('2026-01-01')] })).toBe(true)
        expect(isDeepEqual(date('2026-01-01'), T().PlainDateTime.from('2026-01-01T00:00'))).toBe(false)
        expect(isDeepEqual(T().Duration.from('PT1H'), T().Duration.from('PT1H'))).toBe(true)
        expect(isDeepEqual(T().Duration.from('PT60M'), T().Duration.from('PT1H'))).toBe(false)
    })

    it('never equals a Temporal value to a Date or a plain object, which have no fields to compare either', () => {
        expect(isDeepEqual(date('2026-01-01'), new Date(0))).toBe(false)
        expect(isDeepEqual(new Date(0), date('2026-01-01'))).toBe(false)
        expect(isDeepEqual(date('2026-01-01'), {})).toBe(false)
        expect(isDeepEqual({}, date('2026-01-01'))).toBe(false)
    })

    it.each([
        ['instant', 'Instant'],
        ['zonedDateTime', 'ZonedDateTime'],
        ['plainDateTime', 'PlainDateTime'],
        ['plainDate', 'PlainDate'],
        ['plainTime', 'PlainTime'],
        ['plainYearMonth', 'PlainYearMonth'],
        ['plainMonthDay', 'PlainMonthDay'],
        ['duration', 'Duration'],
    ])("resolves @List('%s') to Temporal.%s", (alias, name) => {
        class AliasDto {
            @List(alias as any) values!: unknown[]
        }
        const meta = new CargoClassMetadata(AliasDto.prototype).getFieldMetadata('values')
        expect(meta.getArrayElementType()).toBe(T()[name])
    })
})
