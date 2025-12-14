import { CargoFieldError, Min, Body } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('min decorator', () => {
    class Sample {
        @Min(10)
        @Body()
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
        @Body()
        @Min(10)
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
