import { Body, List, Type } from '../../src'
import { validateCargoSchema } from './testUtils'

describe('schema validation — primitive constructor skip', () => {
    it('@List(String)같은 프리미티브 element는 nested 검증 대상에서 제외', () => {
        class PrimitiveListDto {
            @Body()
            @List(String)
            tags!: string[]
        }

        expect(() => validateCargoSchema(PrimitiveListDto)).not.toThrow()
    })

    it('@List(Array) 처럼 Array가 elementType으로 들어가도 traversal이 그래도 종료된다', () => {
        class ArrayElementDto {
            @Body()
            @List(Array)
            matrix!: unknown[][]
        }

        expect(() => validateCargoSchema(ArrayElementDto)).not.toThrow()
    })

    it('@Type(Object)처럼 Object가 typeFn으로 들어가도 traversal이 그래도 종료된다', () => {
        class ObjectTypeDto {
            @Body()
            @Type(Object)
            payload!: object
        }

        expect(() => validateCargoSchema(ObjectTypeDto)).not.toThrow()
    })

    it('@List(Date)같은 Date도 nested 검증 대상에서 제외', () => {
        class DateListDto {
            @Body()
            @List(Date)
            timestamps!: Date[]
        }

        expect(() => validateCargoSchema(DateListDto)).not.toThrow()
    })
})
