import { bindingCargo, getCargo, Body, Virtual, Optional, Min, CargoValidationError } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'

class VirtualDTO {
    @Body('firstName') firstName!: string
    @Body('lastName') lastName!: string

    @Virtual((dto: VirtualDTO) => `${dto.firstName} ${dto.lastName}`) fullName!: string
    @Virtual((dto: VirtualDTO) => dto.firstName?.toUpperCase()) @Optional() upperName?: string
    @Virtual((dto: VirtualDTO) => dto.firstName.length + dto.lastName.length) @Min(5) nameLength!: number
    @Virtual((dto: VirtualDTO) => (dto.firstName ? dto.firstName.length : undefined)) @Optional() @Min(3) optionalNameLength?: number
}

class RequiredVirtualDTO {
    @Body('firstName') firstName!: string
    @Body('lastName') lastName!: string

    @Virtual((dto: RequiredVirtualDTO) => (dto.firstName ? dto.firstName.length : undefined))
    @Min(3)
    requiredNameLength!: number
}

describe('virtual binding', () => {
    it('runs the virtual transformer correctly', () => {
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

    it('throws CargoValidationError when a validator fails', () => {
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

    it('skips optional validation even when an optional virtual field returns an empty string', () => {
        const middleware = bindingCargo(VirtualDTO)

        const req = makeMockReq({
            body: { firstName: '', lastName: 'Kimmaria' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const dto = getCargo<VirtualDTO>(req)!
        expect(dto.upperName).toBe('')
        expect(dto.optionalNameLength).toBeNull()
    })

    it('skips validators when a required virtual field is missing', () => {
        const middleware = bindingCargo(RequiredVirtualDTO)

        const req = makeMockReq({
            body: { firstName: '', lastName: 'Kimmaria' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const err = next.mock.calls[0][0]
        expect(err).toBeInstanceOf(CargoValidationError)

        const messages = err.errors.map((error: CargoValidationError['errors'][number]) => error.message)
        expect(messages).toContain('requiredNameLength is required')
        expect(messages).not.toContain('requiredNameLength must be >= 3')
    })
})
