import { bindingCargo, Body, Query, Type, CargoSchemaError } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from '../binding/testUtils'

describe('schema validation — dynamic runtime validation', () => {
    it('throws CargoSchemaError when a class resolved at runtime violates the rules', () => {
        class InvalidDynamicDto {
            @Body()
            @Query() // violates the duplicate-source rule
            foo!: string
        }

        class RootDto {
            @Type((data: any) => (data.kind === 'invalid' ? InvalidDynamicDto : Object))
            @Body('data')
            data!: any
        }

        const middleware = bindingCargo(RootDto)

        // request that resolves to InvalidDynamicDto
        const req = makeMockReq({
            body: {
                data: { kind: 'invalid', foo: 'bar' },
            },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        // validateAnalysis throws, the middleware's try-catch catches it and forwards via next(err)
        const err = next.mock.calls[0][0]
        expect(err).toBeInstanceOf(CargoSchemaError)
        expect(err.message).toContain('InvalidDynamicDto')
        expect(err.message).toContain('foo')
    })

    it('does not re-validate a dynamic class that was already validated (cache check)', () => {
        // functionally similar to the previous case, but verifies that the VALIDATED cache inside
        // validateAnalysis does not misbehave and still allows the next binding to succeed
        class ValidDynamicDto {
            @Body()
            foo!: string
        }

        class RootDto {
            @Type(() => ValidDynamicDto)
            @Body('data')
            data!: any
        }

        const middleware = bindingCargo(RootDto)
        const res = makeMockRes()

        // first request: validation and binding succeed
        const req1 = makeMockReq({ body: { data: { foo: 'bar' } } })
        const next1 = makeNext()
        middleware(req1, res, next1)
        expect(next1).toHaveBeenCalledWith()

        // second request: uses the cached validation result and binding succeeds
        const req2 = makeMockReq({ body: { data: { foo: 'baz' } } })
        const next2 = makeNext()
        middleware(req2, res, next2)
        expect(next2).toHaveBeenCalledWith()
    })
})
