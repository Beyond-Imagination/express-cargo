import { bindingCargo, getCargo } from '../../src'
import { Body, Request, Optional, Min } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'
import { CargoValidationError } from '../../src'

class RequestDTO {
    @Request(req => req.headers['x-user-id']) userId!: string
    @Request(req => Number(req.headers['x-score'])) @Min(10) score!: number
    @Request(req => req.headers['x-optional']) @Optional() optionalField?: string
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
    it('request transformer로 값 바인딩', () => {
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

    it('validator 실패 시 CargoValidationError 발생', () => {
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

    it('optional 필드가 없으면 null 처리', () => {
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

    it('optional request field가 없으면 validation을 건너뛴다', () => {
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

    it('request transformer가 있으면 source binding을 무시한다', () => {
        const middleware = bindingCargo(MixedBindingDTO)

        const req = makeMockReq({
            body: { userId: 'body_user' },
            headers: { 'x-user-id': 'header_user' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<MixedBindingDTO>(req)!
        expect(dto.userId).toBe('header_user')
    })

    it('required request field가 없으면 validator를 건너뛴다', () => {
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
