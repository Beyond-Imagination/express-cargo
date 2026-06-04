import { bindingCargo, Body, getCargo, Type } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'

class NestedDTO {
    @Body('val') val!: string
}

class DynamicA {
    @Type(() => NestedDTO)
    @Body('nested')
    nested!: NestedDTO
}

class DynamicB {
    @Body('other') other!: number
}

class RootDTO {
    // Dynamic Resolver that cannot be analyzed statically
    @Type((data: any) => (data.kind === 'A' ? DynamicA : DynamicB))
    @Body('data')
    data!: DynamicA | DynamicB
}

describe('Dynamic Polymorphism Binding', () => {
    it('should correctly bind dynamically resolved classes and their nested fields', () => {
        const middleware = bindingCargo(RootDTO)
        const req = makeMockReq({
            body: {
                data: {
                    kind: 'A',
                    nested: { val: 'hello' },
                },
            },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<RootDTO>(req)!
        expect(dto.data).toBeInstanceOf(DynamicA)
        expect((dto.data as DynamicA).nested).toBeInstanceOf(NestedDTO)
        expect((dto.data as DynamicA).nested.val).toBe('hello')
    })

    it('should work with type B as well', () => {
        const middleware = bindingCargo(RootDTO)
        const req = makeMockReq({
            body: {
                data: {
                    kind: 'B',
                    other: 123,
                },
            },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<RootDTO>(req)!
        expect(dto.data).toBeInstanceOf(DynamicB)
        expect((dto.data as DynamicB).other).toBe(123)
    })

    it('should throw CargoSchemaError if a dynamically resolved class has an invalid schema (Runtime)', () => {
        class InvalidDTO {
            @Body('id')
            @Body('other') // Duplicate source
            id!: number
        }

        class DynamicRoot {
            // Using a Resolver to force runtime analysis
            @Type((data: any) => (data.kind === 'invalid' ? InvalidDTO : Object))
            @Body('data')
            data!: any
        }

        const middleware = bindingCargo(DynamicRoot)
        const req = makeMockReq({ body: { data: { kind: 'invalid', id: 1 } } })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const err = next.mock.calls[0][0]
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toContain('InvalidDTO')
    })
})
