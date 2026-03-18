import { ArrayMaxSize, Body, CargoFieldError } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('ArrayMaxSize Validator', () => {
    class TestClass {
        @Body()
        @ArrayMaxSize(3)
        items!: any[]

        @Body()
        noValidation!: any[]
    }

    const classMeta = new CargoClassMetadata(TestClass.prototype)

    it('should have arrayMaxSize validator metadata', () => {
        const meta = classMeta.getFieldMetadata('items')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayMaxSize')

        expect(rule).toBeDefined()
        expect(rule?.message).toBe('items must contain no more than 3 elements')
    })

    it('should pass when array length is within the limit', () => {
        const meta = classMeta.getFieldMetadata('items')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayMaxSize')

        expect(rule?.validate([])).toBeNull()
        expect(rule?.validate([1])).toBeNull()
        expect(rule?.validate([1, 2, 3])).toBeNull()
    })

    it('should fail when array length exceeds the limit', () => {
        const meta = classMeta.getFieldMetadata('items')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayMaxSize')

        expect(rule?.validate([1, 2, 3, 4])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([1, 2, 3, 4, 5])).toBeInstanceOf(CargoFieldError)
    })

    it('should fail when value is not an array', () => {
        const meta = classMeta.getFieldMetadata('items')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayMaxSize')

        expect(rule?.validate(1)).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate('string')).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
    })

    it('should support custom error message', () => {
        class CustomMsgClass {
            @ArrayMaxSize(5, 'custom error message')
            field!: any[]
        }

        const meta = new CargoClassMetadata(CustomMsgClass.prototype).getFieldMetadata('field')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayMaxSize')

        expect(rule?.message).toBe('custom error message')
    })

    it('should not have arrayMaxSize validator metadata on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidation')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayMaxSize')

        expect(rule).toBeUndefined()
    })
})
