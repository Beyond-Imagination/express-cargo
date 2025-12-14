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
    it('요청 데이터가 정확히 바인딩되고 타입 캐스팅됨', () => {
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
        expect(dto.nickname).toBeNull() // optional 처리
        expect(dto.score).toBe(5)
    })

    it('validator 실패 시 CargoValidationError 발생', () => {
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

    it('optional 필드가 없으면 null 처리', () => {
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
})
