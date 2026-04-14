import { CargoFieldError, IsTimeZone } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('isTimeZone decorator', () => {
    class Sample {
        @IsTimeZone()
        timezone!: string

        noValidatorValue!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)
    const meta = classMeta.getFieldMetadata('timezone')
    const rule = meta.getValidators()?.find(v => v.type === 'isTimeZone')

    it('should have isTimeZone validator', () => {
        expect(rule).toBeDefined()
        expect(rule?.message).toBe('timezone must be a valid IANA timezone')
    })

    it('should pass for valid IANA timezone strings', () => {
        expect(rule!.validate('Asia/Seoul')).toBeNull()
        expect(rule!.validate('America/New_York')).toBeNull()
        expect(rule!.validate('Europe/London')).toBeNull()
        expect(rule!.validate('UTC')).toBeNull()
        expect(rule!.validate('Pacific/Auckland')).toBeNull()
    })

    it('should fail for invalid timezone strings', () => {
        expect(rule!.validate('Asia/InvalidCity')).toBeInstanceOf(CargoFieldError)
        expect(rule!.validate('Korea/Seoul')).toBeInstanceOf(CargoFieldError)
        expect(rule!.validate('GMT+9')).toBeInstanceOf(CargoFieldError)
        expect(rule!.validate('')).toBeInstanceOf(CargoFieldError)
        expect(rule!.validate('not-a-timezone')).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for non-string values', () => {
        expect(rule!.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(rule!.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(rule!.validate(9)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have isTimeZone validator on undecorated field', () => {
        const noRule = classMeta.getFieldMetadata('noValidatorValue').getValidators()?.find(v => v.type === 'isTimeZone')
        expect(noRule).toBeUndefined()
    })

    it('should support custom error message', () => {
        class CustomMessage {
            @IsTimeZone('invalid timezone')
            timezone!: string
        }

        const customRule = new CargoClassMetadata(CustomMessage.prototype)
            .getFieldMetadata('timezone')
            .getValidators()
            ?.find(v => v.type === 'isTimeZone')

        const error = customRule?.validate('invalid')
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.message).toBe('invalid timezone')
    })
})
