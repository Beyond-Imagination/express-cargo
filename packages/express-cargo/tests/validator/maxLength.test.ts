import { CargoFieldError, MaxLength } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('maxLength decorator', () => {
    class Sample {
        @MaxLength(5)
        stringText!: string

        noValidatorText!: string

        @MaxLength(3)
        notStringType!: any
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should add maxLength validator to stringText', () => {
        const meta = classMeta.getFieldMetadata('stringText')
        const validator = meta.getValidators()?.find(v => v.type === 'maxLength')

        expect(validator).toBeDefined()
        expect(validator?.message).toBe('stringText must not exceed 5 characters')

        expect(validator?.validate('abc')).toBeNull()
        expect(validator?.validate('abcde')).toBeNull()
        expect(validator?.validate('abcdef')).toBeInstanceOf(CargoFieldError)
    })

    it('should not have validator on noValidatorText', () => {
        const meta = classMeta.getFieldMetadata('noValidatorText')
        const validator = meta.getValidators()?.find(v => v.type === 'maxLength')

        expect(validator).toBeUndefined()
    })

    it('should return false if value is not a string', () => {
        const meta = classMeta.getFieldMetadata('notStringType')
        const validator = meta.getValidators()?.find(v => v.type === 'maxLength')

        expect(validator).toBeDefined()
        expect(validator?.validate(123)).toBeInstanceOf(CargoFieldError)
        expect(validator?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(validator?.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(validator?.validate(true)).toBeInstanceOf(CargoFieldError)
    })
})
