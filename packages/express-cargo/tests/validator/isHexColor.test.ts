import { CargoFieldError, IsHexColor } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('isHexColor decorator', () => {
    class Sample {
        @IsHexColor()
        color!: string

        noValidatorValue!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)
    const meta = classMeta.getFieldMetadata('color')
    const isHexColorRule = meta.getValidators()?.find(v => v.type === 'isHexColor')

    it('should have isHexColor validator', () => {
        expect(isHexColorRule).toBeDefined()
        expect(isHexColorRule?.message).toBe('color should be a hex color code')
    })

    it('should pass for valid hex color strings', () => {
        expect(isHexColorRule!.validate('#fff')).toBeNull()
        expect(isHexColorRule!.validate('#FFF')).toBeNull()
        expect(isHexColorRule!.validate('#ffffff')).toBeNull()
        expect(isHexColorRule!.validate('#FFFFFF')).toBeNull()
        expect(isHexColorRule!.validate('#ffff')).toBeNull()
        expect(isHexColorRule!.validate('#ffffffff')).toBeNull()
    })

    it('should fail for invalid hex color strings', () => {
        expect(isHexColorRule!.validate('fff')).toBeInstanceOf(CargoFieldError)
        expect(isHexColorRule!.validate('#gg0000')).toBeInstanceOf(CargoFieldError)
        expect(isHexColorRule!.validate('#ffff00ff00')).toBeInstanceOf(CargoFieldError)
        expect(isHexColorRule!.validate('')).toBeInstanceOf(CargoFieldError)
        expect(isHexColorRule!.validate('#')).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for non-string values', () => {
        expect(isHexColorRule!.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(isHexColorRule!.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(isHexColorRule!.validate(123)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have isHexColor validator on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const rule = meta.getValidators()?.find(v => v.type === 'isHexColor')
        expect(rule).toBeUndefined()
    })

    it('should support custom error message', () => {
        class CustomMessage {
            @IsHexColor('custom error')
            color!: string
        }

        const customMeta = new CargoClassMetadata(CustomMessage.prototype)
        const rule = customMeta.getFieldMetadata('color').getValidators()?.find(v => v.type === 'isHexColor')

        const error = rule?.validate('invalid')
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.message).toBe('custom error')
    })
})
