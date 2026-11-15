import vm from 'node:vm'
import {
    Body,
    Default,
    Each,
    Equal,
    List,
    MaxDate,
    MaxDuration,
    MinDate,
    MinDuration,
    NotEqual,
    OneOf,
    Request,
    Session,
    Transform,
    Type,
    Virtual,
} from '../../src'
import { isTemporalSupported } from '../../src/dateLike'
import { CargoClassMetadata } from '../../src/metadata'
import { fakeTemporalType } from '../dateLike/fakeTemporal'
import { expectViolation, validateCargoSchema } from './testUtils'

const PlainDate = fakeTemporalType('PlainDate')
type PlainDate = InstanceType<typeof PlainDate>
const MESSAGE = 'Temporal.PlainDate fields require Node.js 26 or later with built-in Temporal'

// On a supported runtime this rule never reports; binding Temporal fields is tested there instead.
;(isTemporalSupported() ? describe.skip : describe)('schema validation — Temporal on an unsupported runtime', () => {
    it('rejects a field whose property type is a Temporal type', () => {
        class PropertyTypeDto {
            @Body()
            due!: PlainDate
        }

        expectViolation(() => validateCargoSchema(PropertyTypeDto), 'due', MESSAGE)
    })

    it('rejects a Temporal type given to @Type', () => {
        class TypeDto {
            @Body()
            @Type(() => PlainDate)
            due!: object
        }

        expectViolation(() => validateCargoSchema(TypeDto), 'due', MESSAGE)
    })

    it('rejects a Temporal list element', () => {
        class ListDto {
            @Body()
            @List(PlainDate)
            dues!: PlainDate[]
        }

        expectViolation(() => validateCargoSchema(ListDto), 'dues', MESSAGE)
    })

    it('rejects a Temporal type name given to @List', () => {
        class ListNameDto {
            @Body()
            @List('plainDate')
            dues!: string[]
        }

        expectViolation(() => validateCargoSchema(ListNameDto), 'dues', MESSAGE)
    })

    const realTemporal = (globalThis as { Temporal?: { PlainDate: new () => object } }).Temporal
    ;(realTemporal ? it : it.skip)('rejects the Temporal of a runtime it does not support, such as Node.js 24 with a flag', () => {
        class FlaggedDto {
            @Body()
            @Type(() => realTemporal!.PlainDate)
            due!: object
        }

        expectViolation(() => validateCargoSchema(FlaggedDto), 'due', MESSAGE)
    })

    it('leaves a Temporal list element unset', () => {
        class ListNameDto {
            @Body()
            @List('plainDate')
            dues!: string[]
        }

        expect(new CargoClassMetadata(ListNameDto.prototype).getFieldMetadata('dues').getArrayElementType()).toBeUndefined()
    })

    it('rejects @MinDuration and @MaxDuration, which need Temporal', () => {
        class UntypedDurationDto {
            @Body()
            @MinDuration('PT5M')
            length!: object

            @Body()
            @Each(MaxDuration('PT5M'))
            lengths!: object[]
        }

        expectViolation(() => validateCargoSchema(UntypedDurationDto), 'length', '@MinDuration requires Node.js 26 or later with built-in Temporal')
        expectViolation(() => validateCargoSchema(UntypedDurationDto), 'lengths', '@MaxDuration requires Node.js 26 or later with built-in Temporal')
    })
    ;(typeof (globalThis as { Temporal?: unknown }).Temporal === 'undefined' ? it : it.skip)(
        'rejects @Type(() => Temporal.X) on a runtime without Temporal instead of failing every request',
        () => {
            class TypeThunkDto {
                @Body()
                // @ts-ignore Temporal is not declared for this test project
                @Type(() => Temporal.PlainDate)
                due!: object
            }

            expectViolation(() => validateCargoSchema(TypeThunkDto), 'due', '@Type refers to Temporal, which requires Node.js 26 or later')
        },
    )
    it('leaves a lazy @Type thunk for another class alone, such as one reading a model namespace not loaded yet', () => {
        const models: Record<string, unknown> | undefined = undefined
        class CircularDto {
            @Body()
            @Type(() => (models as any).Duration)
            span!: object
        }

        expect(() => validateCargoSchema(CircularDto)).not.toThrow()
    })

    it('accepts fields without Temporal types', () => {
        class PlainDto {
            @Body()
            due!: Date
        }

        expect(() => validateCargoSchema(PlainDto)).not.toThrow()
    })
})

// These rules look only at declared types, so tagged stand-ins for Temporal types work on every runtime.
describe('schema validation — date and duration bounds on Temporal types', () => {
    const Duration = fakeTemporalType('Duration')
    const PlainMonthDay = fakeTemporalType('PlainMonthDay')
    type Duration = InstanceType<typeof Duration>
    type PlainMonthDay = InstanceType<typeof PlainMonthDay>

    it('rejects @MinDate and @MaxDate on a Duration, pointing to the duration validators', () => {
        class DurationDto {
            @Body()
            @MinDate(new Date(0))
            length!: Duration
        }
        class DurationListDto {
            @Body()
            @List(Duration)
            @Each(MaxDate(new Date(0)))
            lengths!: Duration[]
        }

        expectViolation(() => validateCargoSchema(DurationDto), 'length', '@MinDate cannot be applied to Temporal.Duration; use @MinDuration')
        expectViolation(() => validateCargoSchema(DurationListDto), 'lengths', '@MaxDate cannot be applied to Temporal.Duration; use @MaxDuration')
    })

    it('rejects @MinDate on a PlainMonthDay, which has no order', () => {
        class BirthdayDto {
            @Body()
            @MinDate(new Date(0))
            birthday!: PlainMonthDay
        }

        expectViolation(
            () => validateCargoSchema(BirthdayDto),
            'birthday',
            '@MinDate cannot be applied to Temporal.PlainMonthDay, which has no order',
        )
    })

    it('rejects @MinDuration and @MaxDuration on fields known not to be durations', () => {
        class WrongTypeDto {
            @Body()
            @MinDuration('PT5M')
            name!: string

            @Body()
            @List('date')
            @Each(MaxDuration('PT5M'))
            dates!: string[]
        }

        expectViolation(() => validateCargoSchema(WrongTypeDto), 'name', '@MinDuration can only be applied to Temporal.Duration')
        expectViolation(() => validateCargoSchema(WrongTypeDto), 'dates', '@MaxDuration can only be applied to Temporal.Duration')
    })

    it('rejects @MinDuration on list elements named by a non-Temporal type name, and on an array field itself', () => {
        class NamedListDto {
            @Body()
            @List('date')
            @Each(MinDuration('PT5M'))
            dates!: Date[]

            @Body()
            @MaxDuration('PT5M')
            lengths!: Duration[]
        }

        expectViolation(() => validateCargoSchema(NamedListDto), 'dates', '@MinDuration can only be applied to Temporal.Duration')
        expectViolation(() => validateCargoSchema(NamedListDto), 'lengths', '@MaxDuration can only be applied to Temporal.Duration')
    })
    it('checks every bound validator on a field, not only the first', () => {
        const PlainDate = fakeTemporalType('PlainDate')
        const PlainDateTime = fakeTemporalType('PlainDateTime')
        type PlainDate = InstanceType<typeof PlainDate>

        // Property decorators apply bottom-up, so the matching @MinDate is registered first and the wrong @MaxDate second.
        class SecondBoundDto {
            @Body()
            @MaxDate(new PlainDateTime() as any)
            @MinDate(new PlainDate() as any)
            day!: PlainDate
        }

        expectViolation(() => validateCargoSchema(SecondBoundDto), 'day', 'is a Temporal.PlainDateTime, but the field is a Temporal.PlainDate')
    })

    it('rejects a fixed MinDate or MaxDate bound of another kind than the field, which would fail every request', () => {
        const PlainDate = fakeTemporalType('PlainDate')
        const PlainDateTime = fakeTemporalType('PlainDateTime')
        type PlainDate = InstanceType<typeof PlainDate>

        class MismatchDto {
            @Body()
            @MinDate(new Date(0) as any)
            day!: PlainDate

            @Body()
            @MaxDate(new PlainDateTime() as any)
            other!: PlainDate

            @Body()
            @MinDate(new PlainDate() as any)
            when!: Date
        }

        expectViolation(() => validateCargoSchema(MismatchDto), 'day', 'is a Date, but the field is a Temporal.PlainDate')
        expectViolation(() => validateCargoSchema(MismatchDto), 'other', 'is a Temporal.PlainDateTime, but the field is a Temporal.PlainDate')
        expectViolation(() => validateCargoSchema(MismatchDto), 'when', 'is a Temporal.PlainDate, but the field is a Date')
    })

    it('rejects an Invalid Date bound on a Date field', () => {
        class InvalidBoundDto {
            @Body()
            @MaxDate(new Date('not a date'))
            at!: Date
        }

        expectViolation(() => validateCargoSchema(InvalidBoundDto), 'at', '@MaxDate bound is an Invalid Date')
    })

    it('accepts matching, timestamp and function bounds', () => {
        class MatchingDto {
            @Body()
            @MinDate(new Date(0))
            @MaxDate(Date.now() as any)
            at!: Date

            @Body()
            @MinDate(() => new Date())
            later!: Date
        }

        expect(() => validateCargoSchema(MatchingDto)).not.toThrow()
    })

    it('accepts any bound binding turns into a time, as before: a BigInt, a date object with valueOf, a Date from another realm', () => {
        const otherRealmDate = vm.runInNewContext('new Date(0)')
        const dayjsLike = { valueOf: () => 0, toString: () => '1970-01-01' }

        class LegacyBoundsDto {
            @Body()
            @MinDate(0n as any)
            @MaxDate(dayjsLike as any)
            at!: Date

            @Body()
            @MinDate(otherRealmDate)
            later!: Date
        }

        expect(otherRealmDate instanceof Date).toBe(false)
        expect(() => validateCargoSchema(LegacyBoundsDto)).not.toThrow()
    })

    it('rejects a string bound, and an object that is no time, on a Date field', () => {
        class StringBoundDto {
            @Body()
            @MinDate('2026-01-01' as any)
            at!: Date
        }
        class NaNBoundDto {
            @Body()
            @MinDate({} as any)
            at!: Date
        }

        expectViolation(() => validateCargoSchema(StringBoundDto), 'at', '@MinDate bound 2026-01-01 is a string, but the field is a Date')
        expectViolation(() => validateCargoSchema(NaNBoundDto), 'at', 'is a object, but the field is a Date')
    })
    ;(isTemporalSupported() ? it : it.skip)('checks the second duration bound too', () => {
        class SecondBadDto {
            @Body()
            @MinDuration('P1X')
            @MaxDuration('P1D')
            length!: Duration
        }

        expectViolation(() => validateCargoSchema(SecondBadDto), 'length', '@MinDuration bound P1X is not a valid ISO 8601 duration')
    })
    ;(isTemporalSupported() ? it : it.skip)('rejects a duration bound in months, whose length varies', () => {
        class MonthBoundDto {
            @Body()
            @MaxDuration('P1M')
            period!: Duration
        }

        expectViolation(
            () => validateCargoSchema(MonthBoundDto),
            'period',
            '@MaxDuration bound P1M has years, months or weeks, whose length varies; use days or smaller units, such as P30D',
        )
    })
    ;(isTemporalSupported() ? it : it.skip)('rejects a duration bound that Temporal cannot read', () => {
        class BadBoundDto {
            @Body()
            @MinDuration('5 minutes')
            length!: Duration
        }

        expectViolation(() => validateCargoSchema(BadBoundDto), 'length', '@MinDuration bound 5 minutes is not a valid ISO 8601 duration')
    })
})

describe('schema validation — Equal, NotEqual and OneOf values on Temporal fields', () => {
    const PlainYearMonth = fakeTemporalType('PlainYearMonth')
    const Duration = fakeTemporalType('Duration')
    type PlainYearMonth = InstanceType<typeof PlainYearMonth>
    type Duration = InstanceType<typeof Duration>

    it('rejects values of another kind, which would never match a bound Temporal value', () => {
        class StringValueDto {
            @Body()
            @Equal('2026-11')
            month!: PlainYearMonth

            @Body()
            @NotEqual(new Date(0))
            other!: PlainYearMonth

            @Body()
            @OneOf([new Duration(), 'PT1H'])
            length!: Duration
        }

        expectViolation(
            () => validateCargoSchema(StringValueDto),
            'month',
            '@Equal value 2026-11 is a string, but the field is a Temporal.PlainYearMonth; use Temporal.PlainYearMonth.from(...) instead',
        )
        expectViolation(() => validateCargoSchema(StringValueDto), 'other', '@NotEqual value')
        expectViolation(() => validateCargoSchema(StringValueDto), 'length', '@OneOf value PT1H is a string, but the field is a Temporal.Duration')
    })

    it('rejects a string bound on a Temporal field and checks the @Type target of a nullable field', () => {
        class StaticBoundDto {
            @Body()
            @MinDate('2026-01-01' as any)
            month!: PlainYearMonth

            @Body()
            @Type(() => PlainYearMonth)
            @Equal('2026-11')
            nullable!: PlainYearMonth | null
        }

        expectViolation(
            () => validateCargoSchema(StaticBoundDto),
            'month',
            '@MinDate bound 2026-01-01 is a string, but the field is a Temporal.PlainYearMonth',
        )
        expectViolation(() => validateCargoSchema(StaticBoundDto), 'nullable', '@Equal value 2026-11 is a string')
    })
    ;(isTemporalSupported() ? it : it.skip)('asks for @Type when a Temporal validator sits on a field the binder cannot type', () => {
        const PlainDate = fakeTemporalType('PlainDate')
        class NullableDto {
            @Body()
            @MinDate(new PlainYearMonth() as any)
            month!: PlainYearMonth | null

            @Body()
            @MaxDuration('PT2H')
            length!: Duration | null

            @Body()
            @Each(MinDate(new PlainDate() as any))
            days!: object[]
        }

        const hint = 'needs the field type; add @Type(() => Temporal.X) to a nullable or aliased field'
        expectViolation(() => validateCargoSchema(NullableDto), 'month', `@MinDate ${hint}`)
        expectViolation(() => validateCargoSchema(NullableDto), 'length', `@MaxDuration ${hint}`)
        expectViolation(
            () => validateCargoSchema(NullableDto),
            'days',
            "@MinDate inside @Each needs the element type; add @List(Temporal.X) or @List('plainDate')",
        )
    })

    it('leaves Date validators on untyped fields, and fields whose value code supplies', () => {
        class CodeSuppliedDto {
            @Body()
            @MinDate(new Date(0))
            legacy!: Date | null

            @Body()
            @Transform((value: string) => (globalThis as any).Temporal?.Duration.from(value))
            @MaxDuration('PT2H')
            transformed!: Duration | null

            @Body()
            @MinDate(() => new Date(Date.now()))
            // Temporal in a function body does not make a Date bound a Temporal one.
            fromFunction!: Date | null

            @Virtual(() => new Date())
            @MaxDuration('PT2H')
            computed!: Duration | null

            @Request(() => new Date())
            @MaxDate(new PlainYearMonth() as any)
            received!: PlainYearMonth | undefined

            @Session()
            @MaxDuration('PT2H')
            stored!: Duration | null
        }

        const fields = (() => {
            try {
                validateCargoSchema(CodeSuppliedDto)
                return []
            } catch (e: any) {
                return e.violations
                    .filter((v: { message: string }) => v.message.includes('needs the field type'))
                    .map((v: { field: string }) => v.field)
            }
        })()
        expect(fields).toEqual([])
    })

    it('accepts Temporal values of the field type, and leaves Date and string fields as they were', () => {
        class MatchingDto {
            @Body()
            @Equal(new PlainYearMonth())
            month!: PlainYearMonth

            @Body()
            @OneOf([new Duration(), new Duration()])
            length!: Duration

            @Body()
            @Equal('2026-01-01')
            legacy!: Date

            @Body()
            @OneOf(['a', 'b'])
            name!: string

            @Body()
            @NotEqual(null)
            optional?: PlainYearMonth
        }

        // Fields of these fake types also fail the runtime rule where Temporal is unsupported; only value rules matter here.
        const valueViolations = (() => {
            try {
                validateCargoSchema(MatchingDto)
                return []
            } catch (e: any) {
                return e.violations.filter((v: { message: string }) => /^@(Equal|NotEqual|OneOf)\b/.test(v.message))
            }
        })()
        expect(valueViolations).toEqual([])
    })
    ;(isTemporalSupported() ? it : it.skip)('checks defaults of @Type targets and list elements, and allows a null default', () => {
        const T = (globalThis as any).Temporal
        class DefaultsDto {
            @Body()
            @Type(() => T.Duration)
            @Default('P7X')
            nullable!: object | null

            @Body()
            @List('plainDate')
            @Default(['nope'])
            days!: object[]

            @Body()
            @Default(null)
            // @ts-ignore Temporal is not declared for this test project
            cancelAt?: Temporal.PlainDate
        }

        expectViolation(() => validateCargoSchema(DefaultsDto), 'nullable', '@Default value "P7X" is not a valid Temporal.Duration')
        expectViolation(() => validateCargoSchema(DefaultsDto), 'days', '@Default value "nope" is not a valid Temporal.PlainDate')
        const fields = (() => {
            try {
                validateCargoSchema(DefaultsDto)
                return []
            } catch (e: any) {
                return e.violations.map((v: { field: string }) => v.field)
            }
        })()
        expect(fields).not.toContain('cancelAt')
    })
    ;(isTemporalSupported() ? it : it.skip)('rejects a @Default that cannot become the Temporal field type', () => {
        class DefaultDto {
            @Body()
            @Default('P7X')
            // @ts-ignore Temporal is not declared for this test project
            trial!: Temporal.Duration
        }

        expectViolation(() => validateCargoSchema(DefaultDto), 'trial', '@Default value "P7X" is not a valid Temporal.Duration')
    })
})
