import { minLength } from '../../src/validator'
import { CargoClassMetadata, getFieldMetadata } from '../../src/metadata'

describe('maxLength decorator', () => {
    class Sample {
        @minLength(5)
        stringText!: string

        noValidatorText!: string

        @minLength(3)
        notStringType!: any
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should add minLength validator to stringText', () => {
        const meta = classMeta.getFieldMetadata('stringText')
        const validator = meta.getValidators()?.find(v => v.type === 'minLength')

        expect(validator).toBeDefined()
        expect(validator?.message).toBe('stringText must be at least 5 characters')

        expect(validator?.validate('abc')).toBe(false)
        expect(validator?.validate('abcde')).toBe(true)
        expect(validator?.validate('abcdef')).toBe(true)
    })

    it('should not have validator on noValidatorText', () => {
        const meta = classMeta.getFieldMetadata('noValidatorText')
        const validator = meta.getValidators()?.find(v => v.type === 'minLength')

        expect(validator).toBeUndefined()
    })

    it('should return false if value is not a string', () => {
        const meta = classMeta.getFieldMetadata('notStringType')
        const validator = meta.getValidators()?.find(v => v.type === 'minLength')

        expect(validator).toBeDefined()
        expect(validator?.validate(123)).toBe(false)
        expect(validator?.validate(null)).toBe(false)
        expect(validator?.validate(undefined)).toBe(false)
        expect(validator?.validate(true)).toBe(false)
    })
})