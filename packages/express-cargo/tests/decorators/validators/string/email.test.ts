import { CargoFieldError, Email } from '../../../../src'
import { CargoClassMetadata } from '../../../../src/metadata'

describe('@Email decorator', () => {
    class Sample {
        @Email()
        email!: string

        noValidatorValue!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)
    const meta = classMeta.getFieldMetadata('email')
    const emailRule = meta.getValidators()?.find(v => v.type === 'email')

    it('should have email validator', () => {
        expect(emailRule).toBeDefined()
        expect(emailRule?.message).toBe('email should be a valid email')
    })

    it('should pass for valid email addresses', () => {
        expect(emailRule?.validate('user@example.com')).toBeNull()
        expect(emailRule?.validate('first.last+tag@sub.example.co.kr')).toBeNull()
        expect(emailRule?.validate("o'brien!#$%&*+-/=?^_`{|}~@example.com")).toBeNull()
        expect(emailRule?.validate('USER@EXAMPLE.COM')).toBeNull()
    })

    it('should pass for a host without a dot', () => {
        // The dotted part of the domain is optional, so intranet hosts are accepted.
        expect(emailRule?.validate('user@localhost')).toBeNull()
    })

    it('should fail for malformed addresses', () => {
        expect(emailRule?.validate('plainaddress')).toBeInstanceOf(CargoFieldError)
        expect(emailRule?.validate('user@')).toBeInstanceOf(CargoFieldError)
        expect(emailRule?.validate('@example.com')).toBeInstanceOf(CargoFieldError)
        expect(emailRule?.validate('user@@example.com')).toBeInstanceOf(CargoFieldError)
        expect(emailRule?.validate('user@example..com')).toBeInstanceOf(CargoFieldError)
        expect(emailRule?.validate('')).toBeInstanceOf(CargoFieldError)
    })

    it('should fail when a domain label starts or ends with a hyphen', () => {
        expect(emailRule?.validate('user@-example.com')).toBeInstanceOf(CargoFieldError)
        expect(emailRule?.validate('user@example-.com')).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for addresses containing whitespace', () => {
        expect(emailRule?.validate('user name@example.com')).toBeInstanceOf(CargoFieldError)
        expect(emailRule?.validate('user@exam ple.com')).toBeInstanceOf(CargoFieldError)
        expect(emailRule?.validate('user@example.com ')).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for non-string values', () => {
        expect(emailRule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(emailRule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(emailRule?.validate(123)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have email validator on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const rule = meta.getValidators()?.find(v => v.type === 'email')

        expect(rule).toBeUndefined()
    })

    it('should support custom error message', () => {
        class CustomMessage {
            @Email('custom error')
            value!: string
        }

        const customMeta = new CargoClassMetadata(CustomMessage.prototype)
        const rule = customMeta
            .getFieldMetadata('value')
            .getValidators()
            ?.find(v => v.type === 'email')

        const error = rule?.validate('plainaddress')
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.message).toBe('custom error')
    })
})
