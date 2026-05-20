import { Body, Default, Each, Optional } from '../../src'
import { validateCargoSchema } from '../../src/rules'
import { expectViolation } from './testUtils'

describe('schema validation — @Each usage rules', () => {
    it('@Each 인자로 Source 데코레이터가 들어가면 거부', () => {
        class EachWrapsSourceDto {
            @Body()
            @Each(Body())
            foo!: number[]
        }

        expectViolation(() => validateCargoSchema(EachWrapsSourceDto), 'foo', '@Each cannot wrap source decorator')
    })

    it('@Each 인자로 Missing-Handler 데코레이터(@Optional)가 들어가면 거부', () => {
        class EachWrapsOptionalDto {
            @Body()
            @Each(Optional())
            foo!: number[]
        }

        expectViolation(() => validateCargoSchema(EachWrapsOptionalDto), 'foo', '@Each cannot wrap missing-handler decorator')
    })

    it('@Each 인자로 Missing-Handler 데코레이터(@Default)가 들어가면 거부', () => {
        class EachWrapsDefaultDto {
            @Body()
            @Each(Default(0))
            foo!: number[]
        }

        expectViolation(() => validateCargoSchema(EachWrapsDefaultDto), 'foo', '@Each cannot wrap missing-handler decorator')
    })
})
