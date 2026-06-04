import { Body, Each, Header, List, Min, Optional, Params, Query, Request, Session, Type, Virtual } from '../../src'
import { expectViolation, validateCargoSchema } from './testUtils'

describe('schema validation — kind category rules', () => {
    it('두 Source 데코레이터 공존 시 거부', () => {
        class MultipleSourcesDto {
            @Body()
            @Query()
            foo!: string
        }

        expectViolation(() => validateCargoSchema(MultipleSourcesDto), 'foo', 'pick a single source')
    })

    it('Source + @Request 공존 시 거부', () => {
        class SourceWithRequestDto {
            @Body()
            @Request(req => req.headers['x-foo'])
            foo!: string
        }

        expectViolation(() => validateCargoSchema(SourceWithRequestDto), 'foo', 'cannot be combined with @Request')
    })

    it('Source + @Virtual 공존 시 거부', () => {
        class SourceWithVirtualDto {
            @Body()
            @Virtual(obj => obj.bar)
            foo!: string
        }

        expectViolation(() => validateCargoSchema(SourceWithVirtualDto), 'foo', 'cannot be combined with @Virtual')
    })

    it('@Request + @Virtual 공존 시 거부', () => {
        class RequestWithVirtualDto {
            @Request(req => req.ip)
            @Virtual(obj => obj.bar)
            foo!: string
        }

        expectViolation(() => validateCargoSchema(RequestWithVirtualDto), 'foo', '@Request cannot be combined with @Virtual')
    })

    it('top-level: kind 데코레이터 없는 필드 거부', () => {
        class MissingKindDto {
            @Optional()
            foo!: string
        }

        expectViolation(() => validateCargoSchema(MissingKindDto), 'foo', 'field must be decorated')
    })

    it('nested: @Type 으로 참조된 클래스의 필드도 검증', () => {
        class NestedDto {
            @Optional()
            foo!: string
        }
        class OuterDto {
            @Body()
            @Type(() => NestedDto)
            nested!: NestedDto
        }

        expectViolation(() => validateCargoSchema(OuterDto), 'foo', 'field must be decorated')
    })

    it('nested via @List: 배열 요소 클래스의 필드도 검증', () => {
        class ItemDto {
            @Optional()
            foo!: string
        }
        class ListContainerDto {
            @Body()
            @List(ItemDto)
            items!: ItemDto[]
        }

        expectViolation(() => validateCargoSchema(ListContainerDto), 'foo', 'field must be decorated')
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
