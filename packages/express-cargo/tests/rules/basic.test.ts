import { Body, CargoSchemaError } from '../../src'
import { validateCargoSchema } from '../../src/rules'
import { expectViolation } from './testUtils'

describe('schema validation — basic rules', () => {
    it('rejects a symbol property without a description (A1)', () => {
        const sym = Symbol()

        class SymbolWithoutDescriptionDto {
            @Body()
            [sym]!: string
        }

        try {
            validateCargoSchema(SymbolWithoutDescriptionDto)
        } catch (e) {
            expect(e).toBeInstanceOf(CargoSchemaError)
            expect((e as CargoSchemaError).violations.some(v => v.field === sym && v.message.includes('must have a description'))).toBe(true)
            return
        }
        throw new Error('expected CargoSchemaError to be thrown')
    })

    it('accepts a symbol property with a description', () => {
        const sym = Symbol('userId')

        class SymbolWithDescriptionDto {
            @Body()
            [sym]!: string
        }

        expect(() => validateCargoSchema(SymbolWithDescriptionDto)).not.toThrow()
    })

    it('rejects an empty-string source key (A2)', () => {
        class EmptyKeyDto {
            @Body('')
            foo!: string
        }

        expectViolation(() => validateCargoSchema(EmptyKeyDto), 'foo', 'key must not be an empty string')
    })

    it('accepts @Body() without an explicit key', () => {
        class DefaultKeyDto {
            @Body()
            foo!: string
        }

        expect(() => validateCargoSchema(DefaultKeyDto)).not.toThrow()
    })
})
