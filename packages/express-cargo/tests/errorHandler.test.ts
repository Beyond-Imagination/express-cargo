import { bindingCargo, Body, Min, Transform, CargoValidationError, CargoErrorHandler, setCargoErrorHandler, getCargoErrorHandler } from '../src'
import { makeMockReq, makeMockRes, makeNext } from './binding/testUtils'

class ScoreDTO {
    @Body('score')
    @Min(10)
    score!: number
}

describe('cargo error handler', () => {
    const defaultHandler = getCargoErrorHandler()!

    afterEach(() => {
        // Restore the default handler so custom-handler tests don't leak.
        setCargoErrorHandler(defaultHandler)
    })

    it('forwards the validation error to next by default', () => {
        const req = makeMockReq({ body: { score: 1 } })
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(ScoreDTO)(req, res, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(next.mock.calls[0][0]).toBeInstanceOf(CargoValidationError)
    })

    it('returns the handler that was registered last', () => {
        const handler: CargoErrorHandler = () => {}
        setCargoErrorHandler(handler)

        expect(getCargoErrorHandler()).toBe(handler)
    })

    it('invokes the registered handler instead of next when validation fails', () => {
        const handler = jest.fn()
        setCargoErrorHandler(handler)

        const req = makeMockReq({ body: { score: 1 } })
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(ScoreDTO)(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(handler).toHaveBeenCalledTimes(1)

        const [err, handlerReq, handlerRes, handlerNext] = handler.mock.calls[0]
        expect(err).toBeInstanceOf(CargoValidationError)
        expect(err.errors.map((e: CargoValidationError['errors'][number]) => e.message)).toContain('score must be >= 10')
        expect(handlerReq).toBe(req)
        expect(handlerRes).toBe(res)
        expect(handlerNext).toBe(next)
    })

    it('falls through to the express error middleware when the handler calls next', () => {
        setCargoErrorHandler((err, req, res, next) => next(err))

        const req = makeMockReq({ body: { score: 1 } })
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(ScoreDTO)(req, res, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(next.mock.calls[0][0]).toBeInstanceOf(CargoValidationError)
    })

    it('does not invoke the handler when binding succeeds', () => {
        const handler = jest.fn()
        setCargoErrorHandler(handler)

        const req = makeMockReq({ body: { score: 42 } })
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(ScoreDTO)(req, res, next)

        expect(handler).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith()
    })

    it('does not invoke the handler for errors other than CargoValidationError', () => {
        class ThrowingTransformDTO {
            @Body('name')
            @Transform(() => {
                throw new Error('transform blew up')
            })
            name!: string
        }

        const handler = jest.fn()
        setCargoErrorHandler(handler)

        const req = makeMockReq({ body: { name: 'alice' } })
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(ThrowingTransformDTO)(req, res, next)

        expect(handler).not.toHaveBeenCalled()
        expect(next.mock.calls[0][0]).toEqual(new Error('transform blew up'))
    })
})
