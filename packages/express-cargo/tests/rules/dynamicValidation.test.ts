import { bindingCargo, Body, Query, Type, CargoSchemaError } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from '../binding/testUtils'

describe('schema validation — dynamic runtime validation', () => {
    it('런타임에 결정된 클래스가 규칙을 위반하면 CargoSchemaError 발생', () => {
        class InvalidDynamicDto {
            @Body()
            @Query() // 중복 소스 규칙 위반
            foo!: string
        }

        class RootDto {
            @Type((data: any) => (data.kind === 'invalid' ? InvalidDynamicDto : Object))
            @Body('data')
            data!: any
        }

        const middleware = bindingCargo(RootDto)

        // InvalidDynamicDto를 사용하도록 요청
        const req = makeMockReq({
            body: {
                data: { kind: 'invalid', foo: 'bar' },
            },
        })
        const res = makeMockRes()
        const next = makeNext()

        middleware(req, res, next)

        // validateAnalysis가 에러를 던지고, middleware의 try-catch에서 잡혀 next(err)로 전달됨
        const err = next.mock.calls[0][0]
        expect(err).toBeInstanceOf(CargoSchemaError)
        expect(err.message).toContain('InvalidDynamicDto')
        expect(err.message).toContain('foo')
    })

    it('한 번 검증된 동적 클래스는 다음 요청에서 다시 검증하지 않음 (캐시 확인)', () => {
        // 이 테스트는 기능적으로는 동일하지만, validateAnalysis 내부의 VALIDATED 캐시가 
        // 오작동하지 않고 정상적으로 다음 바인딩을 허용하는지 확인하는 의미가 있음
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

        // 첫 번째 요청: 검증 및 바인딩 성공
        const req1 = makeMockReq({ body: { data: { foo: 'bar' } } })
        const next1 = makeNext()
        middleware(req1, res, next1)
        expect(next1).toHaveBeenCalledWith()

        // 두 번째 요청: 캐시된 검증 결과 사용 및 바인딩 성공
        const req2 = makeMockReq({ body: { data: { foo: 'baz' } } })
        const next2 = makeNext()
        middleware(req2, res, next2)
        expect(next2).toHaveBeenCalledWith()
    })
})
