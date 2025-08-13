import { suffix, validate } from '../../src/validator'
import { CargoClassMetadata } from '../../src/metadata'

describe('validate decorator', () => {
    class Sample {
        @validate(number => number === 1, "number should be 1")
        number1!: number

        number2!: number
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have validate metadata', () => {
        const meta = classMeta.getFieldMetadata('number1')
        const validateRule = meta.getValidators()?.find(v => v.type === 'validate')

        expect(validateRule).toBeDefined()
        expect(validateRule?.message).toBe('number should be 1')
        expect(validateRule?.validate(1)).toBe(true)
        expect(validateRule?.validate(2)).toBe(false)
    })

    it('should not have validate metadata', () => {
        const meta = classMeta.getFieldMetadata('number2')
        const validateRule = meta.getValidators()?.find(v => v.type === 'validate')

        expect(validateRule).toBeUndefined()
    })
})
