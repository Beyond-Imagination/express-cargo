import { adapterForType, adapterForValue, compareDateLike, INVALID_CAST } from '../../src/dateLike'
import { isDeepEqual, isUserDefinedClass } from '../../src/utils'
import { fakeTemporalType } from './fakeTemporal'

describe('Date adapter', () => {
    const adapter = adapterForType(Date)!

    it('is registered for Date only', () => {
        expect(adapter).toBeDefined()
        expect(adapterForType(String)).toBeUndefined()
        expect(adapterForType(class Dto {})).toBeUndefined()
        expect(adapterForValue(new Date())).toBe(adapter)
        expect(adapterForValue('2026-01-01')).toBeUndefined()
        expect(adapterForValue(null)).toBeUndefined()
    })

    it('casts what new Date() accepts and reports the rest as invalid', () => {
        expect(adapter.cast(Date, '2026-01-01')).toEqual(new Date('2026-01-01'))
        expect(adapter.cast(Date, 0)).toEqual(new Date(0))
        expect(adapter.cast(Date, 'not a date')).toBe(INVALID_CAST)
        expect(adapter.invalidMessage(Date)).toBe('must be a valid date')
    })

    it('orders a date against a date, and against a timestamp as `>=` always did', () => {
        const jan = new Date('2026-01-01')
        const feb = new Date('2026-02-01')
        expect(compareDateLike(jan, feb)).toBe(-1)
        expect(compareDateLike(feb, jan)).toBe(1)
        expect(compareDateLike(jan, new Date('2026-01-01'))).toBe(0)
        expect(compareDateLike(feb, jan.getTime())).toBe(1)
    })

    it('cannot order a date against a Temporal bound, whose valueOf() would throw', () => {
        const temporalBound = new (fakeTemporalType('PlainDate'))()
        Object.defineProperty(temporalBound, 'valueOf', {
            value: () => {
                throw new TypeError('use compare() or equals()')
            },
        })
        expect(compareDateLike(new Date('2026-01-01'), temporalBound)).toBeUndefined()
    })

    it('cannot order invalid dates or non-dates', () => {
        const jan = new Date('2026-01-01')
        expect(compareDateLike(new Date('x'), jan)).toBeUndefined()
        expect(compareDateLike(jan, new Date('x'))).toBeUndefined()
        expect(compareDateLike(jan, 'not a date')).toBeUndefined()
        expect(compareDateLike('2026-01-01', jan)).toBeUndefined()
    })

    it('keeps Date a leaf instead of a nested DTO', () => {
        expect(isUserDefinedClass(Date)).toBe(false)
        expect(isUserDefinedClass(class Dto {})).toBe(true)
    })

    it('compares dates by time in deep equality, also inside objects and arrays', () => {
        expect(isDeepEqual(new Date('2026-01-01'), new Date('2026-01-01'))).toBe(true)
        expect(isDeepEqual(new Date('2026-01-01'), new Date('2026-01-02'))).toBe(false)
        expect(isDeepEqual({ at: [new Date(0)] }, { at: [new Date(0)] })).toBe(true)
        expect(isDeepEqual({ at: [new Date(0)] }, { at: [new Date(1)] })).toBe(false)
    })

    it('never equals a date to a value of another kind, which may also have no fields', () => {
        expect(isDeepEqual(new Date(0), {})).toBe(false)
        expect(isDeepEqual({}, new Date(0))).toBe(false)
        expect(isDeepEqual(new Date(0), [])).toBe(false)
        expect(isDeepEqual([new Date(0)], [{}])).toBe(false)
    })
})
