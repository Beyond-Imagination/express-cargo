import { CargoFieldError, IsPhoneNumber } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('isPhoneNumber decorator', () => {
    class Sample {
        @IsPhoneNumber()
        phone!: string

        noValidatorValue!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)
    const meta = classMeta.getFieldMetadata('phone')
    const rule = meta.getValidators()?.find(v => v.type === 'isPhoneNumber')

    it('should have isPhoneNumber validator', () => {
        expect(rule).toBeDefined()
        expect(rule?.message).toBe('phone must be a valid phone number')
    })

    describe('no region (international format)', () => {
        it('should pass for valid international numbers', () => {
            expect(rule!.validate('+821012345678')).toBeNull()
            expect(rule!.validate('+12025551234')).toBeNull()
            expect(rule!.validate('+447911123456')).toBeNull()
        })

        it('should fail for numbers without country code', () => {
            expect(rule!.validate('01012345678')).toBeInstanceOf(CargoFieldError)
            expect(rule!.validate('2025551234')).toBeInstanceOf(CargoFieldError)
        })
    })

    describe('KR region', () => {
        class KrSample {
            @IsPhoneNumber('KR')
            phone!: string
        }

        const krRule = new CargoClassMetadata(KrSample.prototype)
            .getFieldMetadata('phone')
            .getValidators()
            ?.find(v => v.type === 'isPhoneNumber')

        it('should have region in default message', () => {
            expect(krRule?.message).toBe('phone must be a valid phone number for KR')
        })

        it('should pass for valid Korean numbers', () => {
            expect(krRule!.validate('+821012345678')).toBeNull()
            expect(krRule!.validate('01012345678')).toBeNull()
            expect(krRule!.validate('0212345678')).toBeNull()
        })

        it('should fail for invalid Korean numbers', () => {
            expect(krRule!.validate('12345')).toBeInstanceOf(CargoFieldError)
            expect(krRule!.validate('')).toBeInstanceOf(CargoFieldError)
        })
    })

    describe('US region', () => {
        class UsSample {
            @IsPhoneNumber('US')
            phone!: string
        }

        const usRule = new CargoClassMetadata(UsSample.prototype)
            .getFieldMetadata('phone')
            .getValidators()
            ?.find(v => v.type === 'isPhoneNumber')

        it('should pass for valid US numbers', () => {
            expect(usRule!.validate('+12025551234')).toBeNull()
            expect(usRule!.validate('2025551234')).toBeNull()
        })

        it('should fail for invalid US numbers', () => {
            expect(usRule!.validate('12345')).toBeInstanceOf(CargoFieldError)
            expect(usRule!.validate('01012345678')).toBeInstanceOf(CargoFieldError)
        })
    })

    it('should fail for non-string values', () => {
        expect(rule!.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(rule!.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(rule!.validate(821012345678)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have isPhoneNumber validator on undecorated field', () => {
        const noRule = classMeta.getFieldMetadata('noValidatorValue').getValidators()?.find(v => v.type === 'isPhoneNumber')
        expect(noRule).toBeUndefined()
    })

    it('should support custom error message', () => {
        class CustomMessage {
            @IsPhoneNumber(undefined, 'invalid phone')
            phone!: string
        }

        const customRule = new CargoClassMetadata(CustomMessage.prototype)
            .getFieldMetadata('phone')
            .getValidators()
            ?.find(v => v.type === 'isPhoneNumber')

        const error = customRule?.validate('invalid')
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.message).toBe('invalid phone')
    })
})
