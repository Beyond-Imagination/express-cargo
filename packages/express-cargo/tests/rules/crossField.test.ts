import { Body, With, Without } from '../../src'
import { expectViolation, validateCargoSchema } from './testUtils'

describe('schema validation — cross-field reference rules', () => {
    it('rejects @With referencing a non-existent field (G1)', () => {
        class WithUnknownDto {
            @Body()
            @With('ghost')
            foo!: string
        }

        expectViolation(() => validateCargoSchema(WithUnknownDto), 'foo', '@With references unknown field "ghost"')
    })

    it('rejects @Without referencing a non-existent field (G2)', () => {
        class WithoutUnknownDto {
            @Body()
            @Without('ghost')
            foo!: string
        }

        expectViolation(() => validateCargoSchema(WithoutUnknownDto), 'foo', '@Without references unknown field "ghost"')
    })

    it('rejects @With referencing its own field (G3)', () => {
        class WithSelfDto {
            @Body()
            @With('foo')
            foo!: string
        }

        expectViolation(() => validateCargoSchema(WithSelfDto), 'foo', '@With cannot reference its own field "foo"')
    })

    it('rejects @Without referencing its own field (G4)', () => {
        class WithoutSelfDto {
            @Body()
            @Without('foo')
            foo!: string
        }

        expectViolation(() => validateCargoSchema(WithoutSelfDto), 'foo', '@Without cannot reference its own field "foo"')
    })

    it('accepts references to existing fields', () => {
        class CrossFieldValidDto {
            @Body()
            bar!: string

            @Body()
            @With('bar')
            @Without('baz')
            foo!: string

            @Body()
            baz!: string
        }

        expect(() => validateCargoSchema(CrossFieldValidDto)).not.toThrow()
    })
})
