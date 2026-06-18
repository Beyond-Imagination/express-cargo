import { bindingCargo, Body, CargoValidationError, getCargo, Header, Min, Optional, Params, Query, Session } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'

class TestDTO {
    @Body('name') name!: string
    @Query('age') age!: number
    @Params('id') id!: number
    @Header('isAdmin') isAdmin!: boolean
    @Session('loginAt') loginAt!: Date

    @Body('nickname') @Optional() nickname?: string
    @Body('score') @Min(3) score!: number
}

describe('source decorator binding', () => {
    it('binds request data accurately and casts types', () => {
        const middleware = bindingCargo(TestDTO)

        const req = makeMockReq({
            body: { name: 'Alice', nickname: undefined, score: 5 },
            query: { age: '25' },
            params: { id: '10' },
            headers: { isAdmin: 'true' },
            session: { loginAt: '2025-09-20T17:00:00.000Z' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<TestDTO>(req)!
        expect(dto.name).toBe('Alice')
        expect(dto.age).toBe(25)
        expect(dto.id).toBe(10)
        expect(dto.isAdmin).toBe(true)
        expect(dto.loginAt).toEqual(new Date('2025-09-20T17:00:00.000Z'))
        expect(dto.nickname).toBeNull() // optional handling
        expect(dto.score).toBe(5)
    })

    it('throws CargoValidationError when a validator fails', () => {
        const middleware = bindingCargo(TestDTO)

        const req = makeMockReq({
            body: { name: 'Bob', score: 2 }, // score < 3
            query: { age: '30' },
            params: { id: '20' },
            headers: { isAdmin: 'false' },
            session: { loginAt: '2025-09-20T17:00:00.000Z' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const err = next.mock.calls[0][0]
        expect(err).toBeInstanceOf(CargoValidationError)
        expect(err.errors).toEqual(expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining('score') })]))
    })

    it('sets an optional field to null when it is missing', () => {
        const middleware = bindingCargo(TestDTO)

        const req = makeMockReq({
            body: { name: 'Charlie', score: 4 },
            query: { age: '35' },
            params: { id: '30' },
            headers: { isAdmin: 'true' },
            session: { loginAt: '2025-09-20T17:00:00.000Z' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const dto = getCargo<TestDTO>(req)!
        expect(dto.nickname).toBeNull()
    })

    it('preserves the raw object data when targetClass is Object (e.g. any type)', () => {
        class AnyDataDTO {
            @Body('data')
            data!: any // reflected as Object
        }

        const middleware = bindingCargo(AnyDataDTO)
        const rawData = { foo: 'bar', nested: { a: 1 } }
        const req = makeMockReq({ body: { data: rawData } })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<AnyDataDTO>(req)!
        // should match the raw data, not an empty object {}
        expect(dto.data).toEqual(rawData)
    })

    it('skips validators when a required source field is missing', () => {
        const middleware = bindingCargo(TestDTO)

        const req = makeMockReq({
            body: { name: 'Delta' },
            query: { age: '35' },
            params: { id: '30' },
            headers: { isAdmin: 'true' },
            session: { loginAt: '2025-09-20T17:00:00.000Z' },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        const err = next.mock.calls[0][0]
        expect(err).toBeInstanceOf(CargoValidationError)

        const messages = err.errors.map((error: CargoValidationError['errors'][number]) => error.message)
        expect(messages).toContain('score is required')
        expect(messages).not.toContain('score must be >= 3')
    })
})
