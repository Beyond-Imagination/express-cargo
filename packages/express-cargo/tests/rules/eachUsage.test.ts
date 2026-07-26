import { Body, Default, Each, Enum, List, Min, Optional, Transform, Type } from '../../src'
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

    it('rejects @Transform inside @Each', () => {
        class EachWrapsTransformDto {
            @Body()
            @Each(Transform((v: number) => v + 1))
            foo!: number[]
        }

        expectViolation(() => validateCargoSchema(EachWrapsTransformDto), 'foo', '@Each cannot wrap transform decorator')
    })

    it('rejects @List inside @Each', () => {
        class EachWrapsListDto {
            @Body()
            @Each(List('number'))
            foo!: number[]
        }

        expectViolation(() => validateCargoSchema(EachWrapsListDto), 'foo', '@Each cannot wrap type-helper decorator')
    })

    it('rejects @Type inside @Each', () => {
        class Inner {}
        class EachWrapsTypeDto {
            @Body()
            @Each(Type(() => Inner))
            foo!: Inner[]
        }

        expectViolation(() => validateCargoSchema(EachWrapsTypeDto), 'foo', '@Each cannot wrap type-helper decorator')
    })

    it('rejects @Enum inside @Each', () => {
        enum Role {
            ADMIN = 'admin',
            USER = 'user',
        }
        class EachWrapsEnumDto {
            @Body()
            @Each(Enum(Role))
            foo!: Role[]
        }

        expectViolation(() => validateCargoSchema(EachWrapsEnumDto), 'foo', '@Each cannot wrap type-helper decorator')
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
