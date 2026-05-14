import { Body, Each, Header, List, Min, Optional, Params, Query, Request, Session, Type, Virtual } from '../../src'
import { validateCargoSchema } from '../../src/rules'
import { expectViolation } from './testUtils'

describe('schema validation — kind category rules', () => {
    it('B1: 두 Source 데코레이터 공존 시 거부', () => {
        class B1Dto {
            @Body()
            @Query()
            foo!: string
        }

        expectViolation(() => validateCargoSchema(B1Dto), 'B1', 'foo')
    })

    it('B2: Source + @Request 공존 시 거부', () => {
        class B2Dto {
            @Body()
            @Request(req => req.headers['x-foo'])
            foo!: string
        }

        expectViolation(() => validateCargoSchema(B2Dto), 'B2', 'foo')
    })

    it('B3: Source + @Virtual 공존 시 거부', () => {
        class B3Dto {
            @Body()
            @Virtual(obj => obj.bar)
            foo!: string
        }

        expectViolation(() => validateCargoSchema(B3Dto), 'B3', 'foo')
    })

    it('B4: @Request + @Virtual 공존 시 거부', () => {
        class B4Dto {
            @Request(req => req.ip)
            @Virtual(obj => obj.bar)
            foo!: string
        }

        expectViolation(() => validateCargoSchema(B4Dto), 'B4', 'foo')
    })

    it('B5 (top-level): kind 데코레이터 없는 필드 거부', () => {
        class B5Dto {
            @Optional()
            foo!: string
        }

        expectViolation(() => validateCargoSchema(B5Dto), 'B5', 'foo')
    })

    it('B5 (nested): @Type 으로 참조된 클래스의 필드도 검증', () => {
        class NestedDto {
            @Optional()
            foo!: string
        }
        class OuterDto {
            @Body()
            @Type(() => NestedDto)
            nested!: NestedDto
        }

        expectViolation(() => validateCargoSchema(OuterDto), 'B5', 'foo')
    })

    it('B5 (nested via @List): 배열 요소 클래스의 필드도 검증', () => {
        class ItemDto {
            @Optional()
            foo!: string
        }
        class ListContainerDto {
            @Body()
            @List(ItemDto)
            items!: ItemDto[]
        }

        expectViolation(() => validateCargoSchema(ListContainerDto), 'B5', 'foo')
    })

    it('정상 케이스: 단일 Source 데코레이터는 통과', () => {
        class HappyDto {
            @Body()
            foo!: string

            @Query()
            bar!: number
        }

        expect(() => validateCargoSchema(HappyDto)).not.toThrow()
    })

    it('정상 케이스: 모든 종류의 kind 카테고리가 섞여 있어도 충돌만 없으면 통과', () => {
        class MixedHappyDto {
            @Body()
            a!: string

            @Query()
            b!: string

            @Params()
            c!: string

            @Header()
            d!: string

            @Session()
            e!: string

            @Request(req => req.ip)
            f!: string

            @Virtual(obj => obj.a)
            g!: string
        }

        expect(() => validateCargoSchema(MixedHappyDto)).not.toThrow()
    })

    it('정상 케이스: @Each 가 validator 만 감싸는 경우 통과', () => {
        class EachHappyDto {
            @Body()
            @Each(Min(0))
            scores!: number[]
        }

        expect(() => validateCargoSchema(EachHappyDto)).not.toThrow()
    })
})
