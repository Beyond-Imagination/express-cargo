import { isFalse, CargoFieldError } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('isFalse decorator', () => {
    class Sample {
        @isFalse()
        booleanValue!: boolean

        noValidatorValue!: boolean
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have isFalse validator', () => {
        const meta = classMeta.getFieldMetadata('booleanValue')
        const isFalseRule = meta.getValidators()?.find(v => v.type === 'isFalse')

        expect(isFalseRule).toBeDefined()
        expect(isFalseRule?.message).toBe('booleanValue must be false')
        expect(isFalseRule?.validate(true)).toBeInstanceOf(CargoFieldError)
        expect(isFalseRule?.validate(false)).toBeNull()
        expect(isFalseRule?.validate(0)).toBeInstanceOf(CargoFieldError)
        expect(isFalseRule?.validate('')).toBeInstanceOf(CargoFieldError)
        expect(isFalseRule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(isFalseRule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have isFalse validator', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const isFalseRule = meta.getValidators()?.find(v => v.type === 'isFalse')

        expect(isFalseRule).toBeUndefined()
    })
})
