import { Body, Each, Header, List, Min, Optional, Params, Query, Request, Session, Type, Virtual } from '../../src'
import { expectViolation, validateCargoSchema } from './testUtils'

describe('schema validation — kind category rules', () => {
    it('rejects two coexisting source decorators', () => {
        class MultipleSourcesDto {
            @Body()
            @Query()
            foo!: string
        }

        expectViolation(() => validateCargoSchema(MultipleSourcesDto), 'foo', 'pick a single source')
    })

    it('rejects a source decorator coexisting with @Request', () => {
        class SourceWithRequestDto {
            @Body()
            @Request(req => req.headers['x-foo'])
            foo!: string
        }

        expectViolation(() => validateCargoSchema(SourceWithRequestDto), 'foo', 'cannot be combined with @Request')
    })

    it('rejects a source decorator coexisting with @Virtual', () => {
        class SourceWithVirtualDto {
            @Body()
            @Virtual(obj => obj.bar)
            foo!: string
        }

        expectViolation(() => validateCargoSchema(SourceWithVirtualDto), 'foo', 'cannot be combined with @Virtual')
    })

    it('rejects @Request coexisting with @Virtual', () => {
        class RequestWithVirtualDto {
            @Request(req => req.ip)
            @Virtual(obj => obj.bar)
            foo!: string
        }

        expectViolation(() => validateCargoSchema(RequestWithVirtualDto), 'foo', '@Request cannot be combined with @Virtual')
    })

    it('top-level: rejects a field without a kind decorator', () => {
        class MissingKindDto {
            @Optional()
            foo!: string
        }

        expectViolation(() => validateCargoSchema(MissingKindDto), 'foo', 'field must be decorated')
    })

    it('nested: also validates fields of a class referenced via @Type', () => {
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

    it('nested via @List: also validates fields of the array element class', () => {
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

    it('happy path: a single source decorator passes', () => {
        class HappyDto {
            @Body()
            foo!: string

            @Query()
            bar!: number
        }

        expect(() => validateCargoSchema(HappyDto)).not.toThrow()
    })

    it('happy path: a mix of every kind category passes as long as there is no conflict', () => {
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

    it('happy path: passes when @Each wraps only validators', () => {
        class EachHappyDto {
            @Body()
            @Each(Min(0))
            scores!: number[]
        }

        expect(() => validateCargoSchema(EachHappyDto)).not.toThrow()
    })
})
