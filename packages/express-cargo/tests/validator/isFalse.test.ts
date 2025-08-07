import { isFalse } from '../../src/validator'
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
        expect(isFalseRule?.validate(true)).toBe(false)
        expect(isFalseRule?.validate(false)).toBe(true)
    })

    it('should not have isFalse validator', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const isFalseRule = meta.getValidators()?.find(v => v.type === 'isFalse')

        expect(isFalseRule).toBeUndefined()
    })
})
