import { length } from '../../src/validator'
import { CargoClassMetadata } from '../../src/metadata'

describe('length decorator', () => {
    class Sample {
        @length(5)
        stringText!: string

        noValidatorText!: string

        @length(3)
        notStringType!: any
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should add length validator to stringText', () => {
        const meta = classMeta.getFieldMetadata('stringText')
        const validator = meta.getValidators()?.find(v => v.type === 'length')

        expect(validator).toBeDefined()
        expect(validator?.message).toBe('stringText must be 5 characters')

        expect(validator?.validate('abc')).toBe(false)
        expect(validator?.validate('abcde')).toBe(true)
        expect(validator?.validate('abcdef')).toBe(false)
    })

    it('should not have validator on noValidatorText', () => {
        const meta = classMeta.getFieldMetadata('noValidatorText')
        const validator = meta.getValidators()?.find(v => v.type === 'length')

        expect(validator).toBeUndefined()
    })

    it('should return false if value is not a string', () => {
        const meta = classMeta.getFieldMetadata('notStringType')
        const validator = meta.getValidators()?.find(v => v.type === 'length')

        expect(validator).toBeDefined()
        expect(validator?.validate(123)).toBe(false)
        expect(validator?.validate(null)).toBe(false)
        expect(validator?.validate(undefined)).toBe(false)
        expect(validator?.validate(true)).toBe(false)
    })
})
