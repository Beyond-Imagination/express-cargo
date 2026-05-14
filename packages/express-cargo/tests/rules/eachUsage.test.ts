import { Body, Default, Each, Optional } from '../../src'
import { validateCargoSchema } from '../../src/rules'
import { expectViolation } from './testUtils'

describe('schema validation — @Each usage rules', () => {
    it('H2: @Each 인자로 Source 데코레이터가 들어가면 거부', () => {
        class H2Dto {
            @Body()
            @Each(Body())
            foo!: number[]
        }

        expectViolation(() => validateCargoSchema(H2Dto), 'H2', 'foo')
    })

    it('H3: @Each 인자로 Missing-Handler 데코레이터(@Optional)가 들어가면 거부', () => {
        class H3OptionalDto {
            @Body()
            @Each(Optional())
            foo!: number[]
        }

        expectViolation(() => validateCargoSchema(H3OptionalDto), 'H3', 'foo')
    })

    it('H3: @Each 인자로 Missing-Handler 데코레이터(@Default)가 들어가면 거부', () => {
        class H3DefaultDto {
            @Body()
            @Each(Default(0))
            foo!: number[]
        }

        expectViolation(() => validateCargoSchema(H3DefaultDto), 'H3', 'foo')
    })
})
