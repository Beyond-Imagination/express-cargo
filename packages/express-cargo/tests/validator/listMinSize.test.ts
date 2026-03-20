import { ListMinSize, Body, CargoFieldError } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('ListMinSize Validator', () => {
    class TestClass {
        @Body()
        @ListMinSize(3)
        items!: any[]

        @Body()
        noValidation!: any[]
    }

    const classMeta = new CargoClassMetadata(TestClass.prototype)

    it('should have listMinSize validator metadata', () => {
        const meta = classMeta.getFieldMetadata('items')
        const rule = meta.getValidators()?.find(v => v.type === 'listMinSize')

        expect(rule).toBeDefined()
        expect(rule?.message).toBe('items must contain no more than 3 elements')
    })

    it('should pass when list length exceeds the limit', () => {
        const meta = classMeta.getFieldMetadata('items')
        const rule = meta.getValidators()?.find(v => v.type === 'listMinSize')

        expect(rule?.validate([1, 2, 3])).toBeNull()
        expect(rule?.validate([1, 2, 3, 4, 5])).toBeNull()
        expect(rule?.validate([1, 2, 3, 4, 5, 6, 7])).toBeNull()
    })

    it('should fail when list length is lower then the limit', () => {
        const meta = classMeta.getFieldMetadata('items')
        const rule = meta.getValidators()?.find(v => v.type === 'listMinSize')

        expect(rule?.validate([])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([1, 2])).toBeInstanceOf(CargoFieldError)
    })

    it('should fail when value is not an list', () => {
        const meta = classMeta.getFieldMetadata('items')
        const rule = meta.getValidators()?.find(v => v.type === 'listMinSize')

        expect(rule?.validate(1)).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate('string')).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
    })

    it('should support custom error message', () => {
        class CustomMsgClass {
            @ListMinSize(5, 'custom error message')
            field!: any[]
        }

        const meta = new CargoClassMetadata(CustomMsgClass.prototype).getFieldMetadata('field')
        const rule = meta.getValidators()?.find(v => v.type === 'listMinSize')

        expect(rule?.message).toBe('custom error message')
    })

    it('should not have listMinSize validator metadata on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidation')
        const rule = meta.getValidators()?.find(v => v.type === 'listMinSize')

        expect(rule).toBeUndefined()
    })
})
