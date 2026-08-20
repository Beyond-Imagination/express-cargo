import { bindingCargo, Body, Request, Virtual, Transform, CargoFieldError, CargoTransformFieldError, CargoValidationError } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'

/** Runs the middleware and returns the error handed to next(). */
function bindAndCatch(cargoClass: any) {
    const req = makeMockReq({ body: { name: 'alice' }, headers: {} })
    const res = makeMockRes()
    const next = makeNext()

    bindingCargo(cargoClass)(req, res, next)

    return next.mock.calls[0][0]
}

describe('transform field error binding', () => {
    it('wraps a throwing request transformer in CargoTransformFieldError', () => {
        class ThrowingRequestDTO {
            @Request(() => {
                throw new Error('header lookup failed')
            })
            userId!: string
        }

        const error = bindAndCatch(ThrowingRequestDTO)

        expect(error).toBeInstanceOf(CargoValidationError)
        const fieldError = error.errors[0]
        expect(fieldError).toBeInstanceOf(CargoTransformFieldError)
        expect(fieldError.name).toBe('CargoTransformFieldError')
        expect(fieldError.field).toBe('userId')
        expect(fieldError.message).toBe('Error while computing request transform field: header lookup failed')
    })

    it('wraps a throwing virtual transformer in CargoTransformFieldError', () => {
        class ThrowingVirtualDTO {
            @Body('name') name!: string

            @Virtual(() => {
                throw new Error('cannot compute')
            })
            label!: string
        }

        const error = bindAndCatch(ThrowingVirtualDTO)

        const fieldError = error.errors[0]
        expect(fieldError).toBeInstanceOf(CargoTransformFieldError)
        expect(fieldError.field).toBe('label')
        expect(fieldError.message).toBe('Error while computing virtual field: cannot compute')
    })

    it('stringifies a thrown non-Error value', () => {
        class ThrowingStringDTO {
            @Request(() => {
                throw 'plain string'
            })
            userId!: string
        }

        const error = bindAndCatch(ThrowingStringDTO)

        expect(error.errors[0].message).toBe('Error while computing request transform field: plain string')
    })

    it('extends CargoFieldError so a generic error handler still sees it', () => {
        class ThrowingRequestDTO {
            @Request(() => {
                throw new Error('boom')
            })
            userId!: string
        }

        const error = bindAndCatch(ThrowingRequestDTO)

        expect(error.errors[0]).toBeInstanceOf(CargoFieldError)
        expect(error.errors[0]).toBeInstanceOf(Error)
    })

    it('keeps binding the remaining fields after a transformer throws', () => {
        class PartialFailureDTO {
            @Request(() => {
                throw new Error('boom')
            })
            userId!: string

            @Body('missing') missing!: string

            @Virtual(() => {
                throw new Error('another boom')
            })
            label!: string
        }

        const error = bindAndCatch(PartialFailureDTO)

        // Request fields bind first, then sources, then virtuals — every phase runs even after one throws.
        expect(error.errors.map((e: CargoValidationError['errors'][number]) => e.message)).toEqual([
            'Error while computing request transform field: boom',
            'missing is required',
            'Error while computing virtual field: another boom',
        ])
    })

    it('does not wrap a throwing @Transform transformer', () => {
        class ThrowingTransformDTO {
            @Body('name')
            @Transform(() => {
                throw new Error('trim failed')
            })
            name!: string
        }

        const error = bindAndCatch(ThrowingTransformDTO)

        // transformSource() runs outside the try/catch, so the raw error reaches next() untouched.
        expect(error).not.toBeInstanceOf(CargoValidationError)
        expect(error).toEqual(new Error('trim failed'))
    })
})
