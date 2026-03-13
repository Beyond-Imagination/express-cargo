import { CargoFieldError, IsUppercase } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('isUppercase decorator', () => {
    class Sample {
        @IsUppercase()
        uppercaseValue!: string

        noValidatorValue!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)
    const meta = classMeta.getFieldMetadata('uppercaseValue')
    const isUppercaseRule = meta.getValidators()?.find(v => v.type === 'isUppercase')

    it('should have isUppercase validator', () => {
        expect(isUppercaseRule).toBeDefined()
        expect(isUppercaseRule?.message).toBe('uppercaseValue should be uppercase')
    })

    it('should pass for all-uppercase strings', () => {
        expect(isUppercaseRule?.validate('HELLO')).toBeNull()
        expect(isUppercaseRule?.validate('HELLO WORLD')).toBeNull()
        expect(isUppercaseRule?.validate('HELLO123')).toBeNull()
        expect(isUppercaseRule?.validate('')).toBeNull()
    })

    it('should fail for strings with lowercase characters', () => {
        expect(isUppercaseRule?.validate('hello')).toBeInstanceOf(CargoFieldError)
        expect(isUppercaseRule?.validate('Hello')).toBeInstanceOf(CargoFieldError)
        expect(isUppercaseRule?.validate('helloWorld')).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for non-string values', () => {
        expect(isUppercaseRule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(isUppercaseRule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(isUppercaseRule?.validate(123)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have isUppercase validator on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const isUppercaseRule = meta.getValidators()?.find(v => v.type === 'isUppercase')

        expect(isUppercaseRule).toBeUndefined()
    })

    it('should support custom error message', () => {
        class CustomMessage {
            @IsUppercase('custom error')
            value!: string
        }

        const customMeta = new CargoClassMetadata(CustomMessage.prototype)
        const meta = customMeta.getFieldMetadata('value')
        const rule = meta.getValidators()?.find(v => v.type === 'isUppercase')

        const error = rule?.validate('lower')
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.message).toBe('custom error')
    })
})
