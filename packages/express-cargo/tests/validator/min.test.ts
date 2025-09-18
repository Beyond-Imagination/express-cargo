import { CargoFieldError, min, body } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('min decorator', () => {
    class Sample {
        @min(10)
        @body()
        number1!: number

        number2!: number
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have min validator metadata', () => {
        const meta = classMeta.getFieldMetadata('number1')
        const minRule = meta.getValidators()?.find(v => v.type === 'min')

        expect(minRule).toBeDefined()
        expect(minRule?.validate(5)).toBeInstanceOf(CargoFieldError)
        expect(minRule?.validate(15)).toBeNull()
    })

    it('should not have min validator metadata', () => {
        const meta = classMeta.getFieldMetadata('number2')
        const minRule = meta.getValidators()?.find(v => v.type === 'min')

        expect(minRule).toBeUndefined()
    })

    class ExtendedSample extends Sample {
        @body()
        @min(10)
        number3!: number
    }

    const extendedClassMeta = new CargoClassMetadata(ExtendedSample.prototype)

    it('should have min validator metadata on inherited field', () => {
        const meta = extendedClassMeta.getFieldMetadata('number1')
        const minRule = meta.getValidators()?.find(v => v.type === 'min')

        expect(minRule).toBeDefined()
        expect(minRule?.validate(5)).toBeInstanceOf(CargoFieldError)
        expect(minRule?.validate(15)).toBeNull()
    })

    it('should have min validator metadata on extended field', () => {
        const meta = extendedClassMeta.getFieldMetadata('number3')
        const minRule = meta.getValidators()?.find(v => v.type === 'min')

        expect(minRule).toBeDefined()
        expect(minRule?.validate(5)).toBeInstanceOf(CargoFieldError)
        expect(minRule?.validate(15)).toBeNull()
    })

    it('should NOT have validator metadata on undecorated field', () => {
        const meta = extendedClassMeta.getFieldMetadata('number2')
        expect(meta.getValidators()).toEqual([])
    })
})
