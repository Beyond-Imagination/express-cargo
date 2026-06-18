import { Body, Enum, List, Type } from '../../src'
import { expectViolation, validateCargoSchema } from './testUtils'

enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

class Nested {
    @Body()
    value!: string
}

describe('schema validation — type-helper duplication rules', () => {
    it('rejects @Type combined with @List (F1)', () => {
        class TypeAndListDto {
            @Body()
            @Type(() => Nested)
            @List(Nested)
            foo!: Nested[]
        }

        expectViolation(() => validateCargoSchema(TypeAndListDto), 'foo', 'cannot be combined')
    })

    it('rejects @Type combined with @Enum (F2)', () => {
        class TypeAndEnumDto {
            @Body()
            @Type(() => Nested)
            @Enum(Role)
            foo!: Role
        }

        expectViolation(() => validateCargoSchema(TypeAndEnumDto), 'foo', 'cannot be combined')
    })

    it('rejects @List combined with @Enum (F3)', () => {
        class ListAndEnumDto {
            @Body()
            @List(String)
            @Enum(Role)
            foo!: string[]
        }

        expectViolation(() => validateCargoSchema(ListAndEnumDto), 'foo', 'cannot be combined')
    })

    it('rejects @Type applied twice (F4)', () => {
        class TypeTwiceDto {
            @Body()
            @Type(() => Nested)
            @Type(() => Nested)
            foo!: Nested
        }

        expectViolation(() => validateCargoSchema(TypeTwiceDto), 'foo', 'cannot be combined')
    })

    it('accepts a single type-helper', () => {
        class SingleHelperDto {
            @Body()
            @Type(() => Nested)
            foo!: Nested
        }

        expect(() => validateCargoSchema(SingleHelperDto)).not.toThrow()
    })
})
