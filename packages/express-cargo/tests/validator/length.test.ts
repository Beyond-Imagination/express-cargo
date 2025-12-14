import { CargoFieldError, Length } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('length decorator', () => {
    class Sample {
        @Length(5)
        stringText!: string

        noValidatorText!: string

        @Length(3)
        notStringType!: any
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should add length validator to stringText', () => {
        const meta = classMeta.getFieldMetadata('stringText')
        const validator = meta.getValidators()?.find(v => v.type === 'length')

        expect(validator).toBeDefined()
        expect(validator?.message).toBe('stringText must be 5 characters')

        expect(validator?.validate('abc')).toBeInstanceOf(CargoFieldError)
        expect(validator?.validate('abcde')).toBeNull()
        expect(validator?.validate('abcdef')).toBeInstanceOf(CargoFieldError)
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
        expect(validator?.validate(123)).toBeInstanceOf(CargoFieldError)
        expect(validator?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(validator?.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(validator?.validate(true)).toBeInstanceOf(CargoFieldError)
    })
})
