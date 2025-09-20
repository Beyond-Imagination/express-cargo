import { bindingCargo, getCargo } from '../../src'
import { body, virtual, optional, min } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'
import { CargoValidationError } from '../../src'

class VirtualDTO {
    @body('firstName') firstName!: string
    @body('lastName') lastName!: string

    @virtual((dto: VirtualDTO) => `${dto.firstName} ${dto.lastName}`) fullName!: string
    @virtual((dto: VirtualDTO) => dto.firstName?.toUpperCase()) @optional() upperName?: string
    @virtual((dto: VirtualDTO) => dto.firstName.length + dto.lastName.length) @min(5) nameLength!: number
}

describe('virtual binding', () => {
    it('virtual transformer가 정상 동작', () => {
        const middleware = bindingCargo(VirtualDTO)

        const req = makeMockReq({
            body: { firstName: 'Alice', lastName: 'Wonder' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<VirtualDTO>(req)!
        expect(dto.fullName).toBe('Alice Wonder')
        expect(dto.upperName).toBe('ALICE')
        expect(dto.nameLength).toBe(11)
    })

    it('validator 실패 시 CargoValidationError 발생', () => {
        const middleware = bindingCargo(VirtualDTO)

        const req = makeMockReq({
            body: { firstName: 'Al', lastName: 'Li' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const err = next.mock.calls[0][0]
        expect(err).toBeInstanceOf(CargoValidationError)
        expect(err.errors).toEqual(expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining('nameLength') })]))
    })

    it('optional virtual field가 빈 문자열을 반환하는 경우', () => {
        const middleware = bindingCargo(VirtualDTO)

        const req = makeMockReq({
            body: { firstName: '', lastName: 'Kimmaria' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const dto = getCargo<VirtualDTO>(req)!
        expect(dto.upperName).toBe('')
    })
})
