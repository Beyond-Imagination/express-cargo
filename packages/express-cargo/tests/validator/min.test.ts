import { min } from '../../src/validator'
import { CargoClassMetadata } from '../../src/metadata'

describe('min decorator', () => {
    class Sample {
        @min(10)
        number1!: number

        number2!: number
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have min validator metadata', () => {
        const meta = classMeta.getFieldMetadata('number1')
        const minRule = meta.getValidators()?.find(v => v.type === 'min')

        expect(minRule).toBeDefined()
        expect(minRule?.message).toBe('number1 must be >= 10')
        expect(minRule?.validate(5)).toBe(false)
        expect(minRule?.validate(15)).toBe(true)
    })

    it('should not have min validator metadata', () => {
        const meta = classMeta.getFieldMetadata('number2')
        const minRule = meta.getValidators()?.find(v => v.type === 'min')

        expect(minRule).toBeUndefined()
    })

    class ExtendedSample extends Sample {
        @min(10)
        number3!: number
    }

    it('should have min validator metadata on inherited field', () => {
        const meta = getFieldMetadata(ExtendedSample.prototype, 'number1')
        const minRule = meta.validators?.find(v => v.type === 'min')

        expect(minRule).toBeDefined()
        expect(minRule?.message).toBe('number1 must be >= 10')
        expect(minRule?.validate(5)).toBe(false)
        expect(minRule?.validate(15)).toBe(true)
    })

    it('should have min validator metadata on extended field', () => {
        const meta = getFieldMetadata(ExtendedSample.prototype, 'number3')
        const minRule = meta.validators?.find(v => v.type === 'min')

        expect(minRule).toBeDefined()
        expect(minRule?.message).toBe('number3 must be >= 10')
        expect(minRule?.validate(5)).toBe(false)
        expect(minRule?.validate(15)).toBe(true)
    })

    it('should NOT have validator metadata on undecorated field', () => {
        const meta = getFieldMetadata(ExtendedSample.prototype, 'number2')
        expect(meta.validators).toEqual([])
    })
})
