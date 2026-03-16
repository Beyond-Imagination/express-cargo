import { CargoFieldError, IsLowercase } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('isLowercase decorator', () => {
    class Sample {
        @IsLowercase()
        lowercaseValue!: string

        noValidatorValue!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)
    const meta = classMeta.getFieldMetadata('lowercaseValue')
    const isLowercaseRule = meta.getValidators()?.find(v => v.type === 'isLowercase')

    it('should have isLowercase validator', () => {
        expect(isLowercaseRule).toBeDefined()
        expect(isLowercaseRule?.message).toBe('lowercaseValue should be lowercase')
    })

    it('should pass for all-lowercase strings', () => {
        expect(isLowercaseRule?.validate('hello')).toBeNull()
        expect(isLowercaseRule?.validate('hello world')).toBeNull()
        expect(isLowercaseRule?.validate('hello123')).toBeNull()
        expect(isLowercaseRule?.validate('')).toBeNull()
    })

    it('should fail for strings with uppercase characters', () => {
        expect(isLowercaseRule?.validate('HELLO')).toBeInstanceOf(CargoFieldError)
        expect(isLowercaseRule?.validate('Hello')).toBeInstanceOf(CargoFieldError)
        expect(isLowercaseRule?.validate('helloWorld')).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for non-string values', () => {
        expect(isLowercaseRule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(isLowercaseRule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(isLowercaseRule?.validate(123)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have isLowercase validator on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const isLowercaseRule = meta.getValidators()?.find(v => v.type === 'isLowercase')

        expect(isLowercaseRule).toBeUndefined()
    })

    it('should support custom error message', () => {
        class CustomMessage {
            @IsLowercase('custom error')
            value!: string
        }

        const customMeta = new CargoClassMetadata(CustomMessage.prototype)
        const meta = customMeta.getFieldMetadata('value')
        const rule = meta.getValidators()?.find(v => v.type === 'isLowercase')

        const error = rule?.validate('UPPER')
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.message).toBe('custom error')
    })
})
