import { CargoFieldError, isAlpha } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('isAlpha decorator', () => {
    class Sample {
        @isAlpha()
        alphaValue!: string

        noValidatorValue!: boolean
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have isAlpha validator', () => {
        const meta = classMeta.getFieldMetadata('alphaValue')
        const isAlphaRule = meta.getValidators()?.find(v => v.type === 'alpha')

        expect(isAlphaRule).toBeDefined()
        expect(isAlphaRule?.message).toBe('alphaValue should be alphabetic')
        expect(isAlphaRule?.validate('hello')).toBeNull()
        expect(isAlphaRule?.validate('hello123456')).toBeInstanceOf(CargoFieldError)
        expect(isAlphaRule?.validate('0')).toBeInstanceOf(CargoFieldError)
        expect(isAlphaRule?.validate('!@@#$%^&&*')).toBeInstanceOf(CargoFieldError)
        expect(isAlphaRule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(isAlphaRule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have isAlpha validator', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const isAlphaRule = meta.getValidators()?.find(v => v.type === 'alpha')

        expect(isAlphaRule).toBeUndefined()
    })
})
