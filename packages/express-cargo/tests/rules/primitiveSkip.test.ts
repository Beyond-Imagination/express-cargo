import { Body, List, Type } from '../../src'
import { validateCargoSchema } from './testUtils'

describe('schema validation — primitive constructor skip', () => {
    it('excludes primitive elements like @List(String) from nested validation', () => {
        class PrimitiveListDto {
            @Body()
            @List(String)
            tags!: string[]
        }

        expect(() => validateCargoSchema(PrimitiveListDto)).not.toThrow()
    })

    it('terminates traversal even when Array is the elementType, as in @List(Array)', () => {
        class ArrayElementDto {
            @Body()
            @List(Array)
            matrix!: unknown[][]
        }

        expect(() => validateCargoSchema(ArrayElementDto)).not.toThrow()
    })

    it('terminates traversal even when Object is the typeFn, as in @Type(Object)', () => {
        class ObjectTypeDto {
            @Body()
            @Type(Object)
            payload!: object
        }

        expect(() => validateCargoSchema(ObjectTypeDto)).not.toThrow()
    })

    it('excludes Date elements like @List(Date) from nested validation', () => {
        class DateListDto {
            @Body()
            @List(Date)
            timestamps!: Date[]
        }

        expect(() => validateCargoSchema(DateListDto)).not.toThrow()
    })
})
