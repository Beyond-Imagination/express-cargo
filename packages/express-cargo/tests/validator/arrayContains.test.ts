import { ArrayContains, Body, CargoFieldError } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('ArrayContains Validator', () => {
    class TestClass {
        @Body()
        @ArrayContains([1, 2])
        numbers!: number[]

        @Body()
        noValidation!: number[]
    }

    const classMeta = new CargoClassMetadata(TestClass.prototype)

    it('should have arrayContains validator metadata', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule).toBeDefined()
    })

    it('should pass validation when array contains all required values', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate([1, 2, 3])).toBeNull()
        expect(rule?.validate([1, 2])).toBeNull()
        expect(rule?.validate([2, 1])).toBeNull()
    })

    it('should fail validation when array is missing required values', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate([1])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([2])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([3, 4])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([])).toBeInstanceOf(CargoFieldError)
    })

    it('should fail validation when value is not an array', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate(1)).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate('string')).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have arrayContains validator metadata on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidation')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule).toBeUndefined()
    })
})
