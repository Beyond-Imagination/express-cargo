import { maxLength } from '../../src/validator'
import { getFieldMetadata } from '../../src/metadata'

describe('maxLength decorator', () => {
    class Sample {
        @maxLength(5)
        stringText!: string

        noValidatorText!: string

        @maxLength(3)
        notStringType!: any
    }

    it('should add maxLength validator to stringText', () => {
        const meta = getFieldMetadata(Sample.prototype, 'stringText')
        const validator = meta.validators?.find(v => v.type === 'maxLength')

        expect(validator).toBeDefined()
        expect(validator?.message).toBe('stringText must not exceed 5 characters')

        expect(validator?.validate('abc')).toBe(true)
        expect(validator?.validate('abcde')).toBe(true)
        expect(validator?.validate('abcdef')).toBe(false)
    })

    it('should not have validator on noValidatorText', () => {
        const meta = getFieldMetadata(Sample.prototype, 'noValidatorText')
        const validator = meta.validators?.find(v => v.type === 'maxLength')

        expect(validator).toBeUndefined()
    })

    it('should return false if value is not a string', () => {
        const meta = getFieldMetadata(Sample.prototype, 'notStringType')
        const validator = meta.validators?.find(v => v.type === 'maxLength')

        expect(validator).toBeDefined()
        expect(validator?.validate(123)).toBe(false)
        expect(validator?.validate(null)).toBe(false)
        expect(validator?.validate(undefined)).toBe(false)
        expect(validator?.validate(true)).toBe(false)
    })
})