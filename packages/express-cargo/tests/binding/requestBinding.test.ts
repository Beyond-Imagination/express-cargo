import { bindingCargo, getCargo } from '../../src'
import { Body, Request, Optional, Min } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'
import { CargoSchemaError, CargoValidationError } from '../../src'

class RequestDTO {
    @Request(req => req.headers['x-user-id'])
    userId!: string

    @Request(req => Number(req.headers['x-score']))
    @Min(10)
    score!: number

    @Request(req => req.headers['x-optional'])
    @Optional()
    optionalField?: string

    @Request(req => (req.headers['x-optional-score'] ? Number(req.headers['x-optional-score']) : undefined))
    @Optional()
    @Min(10)
    optionalScore?: number
}

class MixedBindingDTO {
    @Body('userId')
    @Request(req => req.headers['x-user-id'])
    userId!: string
}

class RequiredRequestDTO {
    @Request(req => (req.headers['x-required-score'] ? Number(req.headers['x-required-score']) : undefined))
    @Min(10)
    requiredScore!: number
}

describe('request binding', () => {
    it('binds values via request transformer', () => {
        const middleware = bindingCargo(RequestDTO)

        const req = makeMockReq({
            headers: { 'x-user-id': 'user_123', 'x-score': '42' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const dto = getCargo<RequestDTO>(req)!

        expect(next).toHaveBeenCalledWith()
        expect(dto.userId).toBe('user_123')
        expect(dto.score).toBe(42)
        expect(dto.optionalField).toBeNull()
    })

    it('throws CargoValidationError when a validator fails', () => {
        const middleware = bindingCargo(RequestDTO)

        const req = makeMockReq({
            headers: { 'x-user-id': 'user_123', 'x-score': '5' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const err = next.mock.calls[0][0]
        expect(err).toBeInstanceOf(CargoValidationError)
        expect(err.errors).toEqual(expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining('score') })]))
    })

    it('sets an optional field to null when it is missing', () => {
        const middleware = bindingCargo(RequestDTO)

        const req = makeMockReq({
            headers: { 'x-user-id': 'user_456', 'x-score': '20' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const dto = getCargo<RequestDTO>(req)!
        expect(dto.optionalField).toBeNull()
    })

    it('skips validation when an optional request field is missing', () => {
        const middleware = bindingCargo(RequestDTO)

        const req = makeMockReq({
            headers: { 'x-user-id': 'user_789', 'x-score': '20' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<RequestDTO>(req)!
        expect(dto.optionalScore).toBeNull()
    })

    it('rejects combining a source decorator with @Request', () => {
        expect(() => bindingCargo(MixedBindingDTO)).toThrow(CargoSchemaError)
    })

    it('throws when getCargo is called without the bindingCargo middleware', () => {
        const req = makeMockReq()
        expect(() => getCargo<RequestDTO>(req)).toThrow(/bindingCargo/)
    })

    it('throws from getCargo even when _cargo is null', () => {
        const req = makeMockReq({ _cargo: null } as any)
        expect(() => getCargo<RequestDTO>(req)).toThrow(/bindingCargo/)
    })

    it('skips validators when a required request field is missing', () => {
        const middleware = bindingCargo(RequiredRequestDTO)

        const req = makeMockReq({
            headers: {},
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const err = next.mock.calls[0][0]
        expect(err).toBeInstanceOf(CargoValidationError)

        const messages = err.errors.map((error: CargoValidationError['errors'][number]) => error.message)
        expect(messages).toContain('requiredScore is required')
        expect(messages).not.toContain('requiredScore must be >= 10')
    })
})
