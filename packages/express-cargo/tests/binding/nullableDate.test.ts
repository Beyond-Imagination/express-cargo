import { bindingCargo, Body, CargoValidationError, MinDate, Optional } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'

// `Date | null` compiles to design:type Object, so the binder cannot cast the value. This pins what such a field
// does without @Type: it starts as before, and a sent value fails MinDate because it stays a string.
describe('Date | null field without @Type', () => {
    class NullableDto {
        @Body() @Optional() @MinDate(new Date('2026-01-01')) resumeAt!: Date | null
    }

    it('starts and accepts a missing value', () => {
        const next = makeNext()
        bindingCargo(NullableDto)(makeMockReq({ body: {} }), makeMockRes(), next)
        expect(next).toHaveBeenCalledWith()
    })

    it('leaves a sent value a string, so MinDate fails it', () => {
        const next = makeNext()
        bindingCargo(NullableDto)(makeMockReq({ body: { resumeAt: '2027-01-01' } }), makeMockRes(), next)
        expect((next.mock.calls[0][0] as CargoValidationError).errors.map(e => e.message)).toEqual([
            'resumeAt must be on or after ' + new Date('2026-01-01'),
        ])
    })
})
