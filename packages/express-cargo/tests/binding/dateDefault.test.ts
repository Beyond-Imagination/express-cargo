import { bindingCargo, Body, Default, getCargo, List, Optional, Query, Type } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'

describe('@Default on Date fields', () => {
    function bind<D>(dto: new () => D) {
        const req = makeMockReq({ body: {} })
        const next = makeNext()
        bindingCargo(dto)(req, makeMockRes(), next)
        return { req, next }
    }

    it('casts a string default to a Date, as a sent value would be', () => {
        class StartDto {
            @Body() @Default('2026-01-01') startsAt!: Date
        }
        const { req, next } = bind(StartDto)

        expect(next).toHaveBeenCalledWith()
        expect(getCargo<StartDto>(req)!.startsAt).toEqual(new Date('2026-01-01'))
    })

    it('gives each request its own copy of a Date default', () => {
        const fallback = new Date('2026-01-01')
        class CopyDto {
            @Body() @Default(fallback) startsAt!: Date
        }
        const first = bind(CopyDto)
        getCargo<CopyDto>(first.req)!.startsAt.setFullYear(1999)

        expect(getCargo<CopyDto>(bind(CopyDto).req)!.startsAt).toEqual(new Date('2026-01-01'))
        expect(fallback).toEqual(new Date('2026-01-01'))
    })

    it('rejects a default that is not a date when the middleware is created', () => {
        class BrokenDto {
            @Body() @Default('not a date') startsAt!: Date
        }

        expect(() => bindingCargo(BrokenDto)).toThrow('@Default value "not a date" is not a valid Date')
    })

    it('keeps null and boolean defaults as they are', () => {
        class NullDto {
            @Query() @Default(null) cancelledAt?: Date
            @Query() @Default(true) flag?: Date
        }
        const { req, next } = bind(NullDto)

        expect(next).toHaveBeenCalledWith()
        expect(getCargo<NullDto>(req)!.cancelledAt).toBeNull()
        expect(getCargo<NullDto>(req)!.flag).toBe(true)
    })

    it('casts the default of a nullable field typed with @Type', () => {
        class NullableDto {
            @Body() @Type(() => Date) @Default('2026-01-01') startsAt!: Date | null
        }
        const { req } = bind(NullableDto)

        expect(getCargo<NullableDto>(req)!.startsAt).toEqual(new Date('2026-01-01'))
    })

    it('casts list defaults element by element, in a new array for each request', () => {
        class ListDto {
            @Body() @List(Date) @Default(['2026-01-01']) days!: Date[]
        }
        const first = bind(ListDto)
        getCargo<ListDto>(first.req)!.days.push(new Date(0))

        expect(getCargo<ListDto>(bind(ListDto).req)!.days).toEqual([new Date('2026-01-01')])
    })

    it('rejects a Temporal value as a Date default when the middleware is created', () => {
        const PlainDate = function PlainDate() {} as unknown as new () => object
        Object.defineProperty(PlainDate.prototype, Symbol.toStringTag, { value: 'Temporal.PlainDate' })
        class TemporalDefaultDto {
            @Body() @Default(new PlainDate()) startsAt!: Date
        }

        expect(() => bindingCargo(TemporalDefaultDto)).toThrow('@Default value Temporal.PlainDate is not a valid Date')
    })

    it.each([
        ['a Symbol', Symbol('s'), 'symbol'],
        ['a BigInt', BigInt(0), 'bigint'],
        ['an object without a prototype', Object.create(null), 'object'],
    ])('rejects %s as a Date default with a schema error, not a raw TypeError', (_name, value, kind) => {
        class OddDefaultDto {
            @Body() @Default(value) startsAt!: Date
        }

        expect(() => bindingCargo(OddDefaultDto)).toThrow(`@Default value ${kind} is not a valid Date`)
    })

    it('leaves an optional field without a default as null', () => {
        class OptionalDto {
            @Body() @Optional() startsAt?: Date
        }
        expect(getCargo<OptionalDto>(bind(OptionalDto).req)!.startsAt).toBeNull()
    })
})
