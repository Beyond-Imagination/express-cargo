import { Body, Default, Optional } from '../../src'
import { expectViolation, validateCargoSchema } from './testUtils'

describe('schema validation — missing-handler duplication rules', () => {
    it('rejects @Optional combined with @Default (C1)', () => {
        class OptionalAndDefaultDto {
            @Body()
            @Optional()
            @Default(0)
            foo!: number
        }

        expectViolation(() => validateCargoSchema(OptionalAndDefaultDto), 'foo', 'cannot be combined')
    })

    it('accepts @Optional alone', () => {
        class OptionalOnlyDto {
            @Body()
            @Optional()
            foo!: number
        }

        expect(() => validateCargoSchema(OptionalOnlyDto)).not.toThrow()
    })

    it('accepts @Default alone', () => {
        class DefaultOnlyDto {
            @Body()
            @Default(0)
            foo!: number
        }

        expect(() => validateCargoSchema(DefaultOnlyDto)).not.toThrow()
    })
})
