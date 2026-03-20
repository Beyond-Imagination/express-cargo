import { CargoFieldError, IsUrl } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('isUrl decorator', () => {
    class Sample {
        @IsUrl()
        url!: string

        noValidatorValue!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)
    const meta = classMeta.getFieldMetadata('url')
    const isUrlRule = meta.getValidators()?.find(v => v.type === 'isUrl')

    it('should have isUrl validator', () => {
        expect(isUrlRule).toBeDefined()
        expect(isUrlRule?.message).toBe('url should be a valid URL')
    })

    it('should pass for valid http/https URLs', () => {
        expect(isUrlRule?.validate('http://example.com')).toBeNull()
        expect(isUrlRule?.validate('https://example.com')).toBeNull()
        expect(isUrlRule?.validate('https://example.com/path?query=1#hash')).toBeNull()
    })

    it('should fail for non-URL strings', () => {
        expect(isUrlRule?.validate('not-a-url')).toBeInstanceOf(CargoFieldError)
        expect(isUrlRule?.validate('example.com')).toBeInstanceOf(CargoFieldError)
        expect(isUrlRule?.validate('')).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for disallowed protocols by default', () => {
        expect(isUrlRule?.validate('ftp://example.com')).toBeInstanceOf(CargoFieldError)
        expect(isUrlRule?.validate('ws://example.com')).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for non-string values', () => {
        expect(isUrlRule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(isUrlRule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(isUrlRule?.validate(123)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have isUrl validator on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const rule = meta.getValidators()?.find(v => v.type === 'isUrl')
        expect(rule).toBeUndefined()
    })

    it('should support custom protocols option', () => {
        class FtpSample {
            @IsUrl({ protocols: ['ftp'] })
            url!: string
        }

        const ftpMeta = new CargoClassMetadata(FtpSample.prototype)
        const rule = ftpMeta.getFieldMetadata('url').getValidators()?.find(v => v.type === 'isUrl')

        expect(rule?.validate('ftp://example.com')).toBeNull()
        expect(rule?.validate('http://example.com')).toBeInstanceOf(CargoFieldError)
    })

    it('should support custom error message', () => {
        class CustomMessage {
            @IsUrl(undefined, 'custom error')
            value!: string
        }

        const customMeta = new CargoClassMetadata(CustomMessage.prototype)
        const rule = customMeta.getFieldMetadata('value').getValidators()?.find(v => v.type === 'isUrl')

        const error = rule?.validate('not-a-url')
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.message).toBe('custom error')
    })
})
