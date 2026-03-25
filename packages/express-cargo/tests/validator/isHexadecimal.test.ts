import { CargoFieldError, IsHexadecimal } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('isHexadecimal decorator', () => {
    class Sample {
        @IsHexadecimal()
        value!: string

        noValidatorValue!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)
    const meta = classMeta.getFieldMetadata('value')
    const isHexRule = meta.getValidators()?.find(v => v.type === 'isHexadecimal')

    it('should have isHexadecimal validator', () => {
        expect(isHexRule).toBeDefined()
        expect(isHexRule!.message).toBe('value should be a hexadecimal number')
    })

    it('should pass for valid hexadecimal strings', () => {
        expect(isHexRule!.validate('0')).toBeNull()
        expect(isHexRule!.validate('ff')).toBeNull()
        expect(isHexRule!.validate('FF')).toBeNull()
        expect(isHexRule!.validate('deadbeef')).toBeNull()
        expect(isHexRule!.validate('0123456789abcdefABCDEF')).toBeNull()
        expect(isHexRule!.validate('0x1A')).toBeNull()
        expect(isHexRule!.validate('0xFF')).toBeNull()
        expect(isHexRule!.validate('0hFF')).toBeNull()
    })

    it('should fail for strings with non-hex characters', () => {
        expect(isHexRule!.validate('xyz')).toBeInstanceOf(CargoFieldError)
        expect(isHexRule!.validate('gg')).toBeInstanceOf(CargoFieldError)
        expect(isHexRule!.validate('')).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for non-string values', () => {
        expect(isHexRule!.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(isHexRule!.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(isHexRule!.validate(255)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have isHexadecimal validator on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const rule = meta.getValidators()?.find(v => v.type === 'isHexadecimal')
        expect(rule).toBeUndefined()
    })

    it('should support custom error message', () => {
        class CustomMessage {
            @IsHexadecimal('custom error')
            value!: string
        }

        const customMeta = new CargoClassMetadata(CustomMessage.prototype)
        const rule = customMeta.getFieldMetadata('value').getValidators()?.find(v => v.type === 'isHexadecimal')

        const error = rule?.validate('xyz')
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.message).toBe('custom error')
    })
})
