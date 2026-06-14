import { Body, List, Type } from '../../src'
import { expectViolation, validateCargoSchema } from './testUtils'

class Nested {
    @Body()
    value!: string
}

describe('schema validation — type-helper placement rules', () => {
    it('rejects @List on a non-array field (M1)', () => {
        class ListOnNonArrayDto {
            @Body()
            @List(Nested)
            foo!: Nested
        }

        expectViolation(() => validateCargoSchema(ListOnNonArrayDto), 'foo', '@List can only be applied to array fields')
    })

    it('accepts @List on an array field', () => {
        class ListOnArrayDto {
            @Body()
            @List(Nested)
            foo!: Nested[]
        }

        expect(() => validateCargoSchema(ListOnArrayDto)).not.toThrow()
    })

    it('rejects @Type on a primitive field (M2)', () => {
        class TypeOnPrimitiveDto {
            @Body()
            @Type(() => Nested)
            foo!: string
        }

        expectViolation(() => validateCargoSchema(TypeOnPrimitiveDto), 'foo', '@Type cannot be applied to a primitive field')
    })

    it('accepts @Type on an object field', () => {
        class TypeOnObjectDto {
            @Body()
            @Type(() => Nested)
            foo!: Nested
        }

        expect(() => validateCargoSchema(TypeOnObjectDto)).not.toThrow()
    })
})
