import { isTrue } from '../../src/validator'
import { getFieldMetadata } from '../../src/metadata'

describe('isTrue decorator', () => {
    class Sample {
        @isTrue()
        booleanValue!: boolean

        noValidatorValue!: boolean
    }

    it('should have isTrue validator', () => {
        const meta = getFieldMetadata(Sample.prototype, 'booleanValue')
        const isTrueRule = meta.validators?.find(v => v.type === 'isTrue')

        expect(isTrueRule).toBeDefined()
        expect(isTrueRule?.message).toBe('booleanValue must be true')
        expect(isTrueRule?.validate(true)).toBe(true)
        expect(isTrueRule?.validate(false)).toBe(false)
    })

    it('should not have isTrue validator', () => {
        const meta = getFieldMetadata(Sample.prototype, 'noValidatorValue')
        const isTrueRule = meta.validators?.find(v => v.type === 'isTrue')

        expect(isTrueRule).toBeUndefined()
    })
})
