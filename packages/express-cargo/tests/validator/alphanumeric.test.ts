import { Alphanumeric, CargoFieldError } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('alphanumeric decorator', () => {
    class Sample {
        @Alphanumeric()
        alphanumericValue!: string

        noValidatorValue!: boolean
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have alphanumeric validator', () => {
        const meta = classMeta.getFieldMetadata('alphanumericValue')
        const alphanumericRule = meta.getValidators()?.find(v => v.type === 'alphanumeric')

        expect(alphanumericRule).toBeDefined()
        expect(alphanumericRule?.message).toBe('alphanumericValue should be alphanumeric')
        expect(alphanumericRule?.validate('hello123456')).toBeNull()
        expect(alphanumericRule?.validate('hello')).toBeNull()
        expect(alphanumericRule?.validate('0')).toBeNull()
        expect(alphanumericRule?.validate('!@@#$%^&&*')).toBeInstanceOf(CargoFieldError)
        expect(alphanumericRule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(alphanumericRule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have alphanumeric validator', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const alphanumericRule = meta.getValidators()?.find(v => v.type === 'alphanumeric')

        expect(alphanumericRule).toBeUndefined()
    })
})
