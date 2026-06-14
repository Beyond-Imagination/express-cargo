import { Body, Default, Each, Min, Optional } from '../../src'
import { expectViolation, validateCargoSchema } from './testUtils'

describe('schema validation — @Each usage rules', () => {
    it('rejects a source decorator inside @Each (H2)', () => {
        class EachWrapsSourceDto {
            @Body()
            @Each(Body())
            foo!: number[]
        }

        expectViolation(() => validateCargoSchema(EachWrapsSourceDto), 'foo', '@Each cannot wrap source decorator')
    })

    it('rejects @Optional inside @Each (H3)', () => {
        class EachWrapsOptionalDto {
            @Body()
            @Each(Optional())
            foo!: number[]
        }

        expectViolation(() => validateCargoSchema(EachWrapsOptionalDto), 'foo', '@Each cannot wrap missing-handler decorator')
    })

    it('rejects @Default inside @Each (H3)', () => {
        class EachWrapsDefaultDto {
            @Body()
            @Each(Default(0))
            foo!: number[]
        }

        expectViolation(() => validateCargoSchema(EachWrapsDefaultDto), 'foo', '@Each cannot wrap missing-handler decorator')
    })

    it('rejects @Each on a non-array field (H1)', () => {
        class EachOnNonArrayDto {
            @Body()
            @Each(Min(0))
            foo!: string
        }

        expectViolation(() => validateCargoSchema(EachOnNonArrayDto), 'foo', '@Each can only be applied to array fields')
    })

    it('accepts @Each on an array field', () => {
        class EachOnArrayDto {
            @Body()
            @Each(Min(0))
            foo!: number[]
        }

        expect(() => validateCargoSchema(EachOnArrayDto)).not.toThrow()
    })
})
