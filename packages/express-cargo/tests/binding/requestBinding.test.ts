import { bindingCargo, getCargo } from '../../src'
import { request, optional, min } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'
import { CargoValidationError } from '../../src'

class RequestDTO {
    @request(req => req.headers['x-user-id']) userId!: string
    @request(req => req.headers['x-score']) @min(10) score!: number
    @request(req => req.headers['x-optional']) @optional() optionalField?: string
}

describe('request binding', () => {
    it('request transformer로 값 바인딩', () => {
        const middleware = bindingCargo(RequestDTO)

        const req = makeMockReq({
            headers: { 'x-user-id': 'user_123', 'x-score': 42 },
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
            headers: { 'x-user-id': 'user_123', 'x-score': 5 },
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
            headers: { 'x-user-id': 'user_456', 'x-score': 20 },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const dto = getCargo<RequestDTO>(req)!
        expect(dto.optionalField).toBeNull()
    })
})
