import { ListMaxSize, Body, CargoFieldError } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('ListMaxSize Validator', () => {
    class TestClass {
        @Body()
        @ListMaxSize(3)
        items!: any[]

        @Body()
        noValidation!: any[]
    }

    const classMeta = new CargoClassMetadata(TestClass.prototype)

    it('should have listMaxSize validator metadata', () => {
        const meta = classMeta.getFieldMetadata('items')
        const rule = meta.getValidators()?.find(v => v.type === 'listMaxSize')

        expect(rule).toBeDefined()
        expect(rule?.message).toBe('items must contain no more than 3 elements')
    })

    it('should pass when list length is within the limit', () => {
        const meta = classMeta.getFieldMetadata('items')
        const rule = meta.getValidators()?.find(v => v.type === 'listMaxSize')

        expect(rule?.validate([])).toBeNull()
        expect(rule?.validate([1])).toBeNull()
        expect(rule?.validate([1, 2, 3])).toBeNull()
    })

    it('should fail when list length exceeds the limit', () => {
        const meta = classMeta.getFieldMetadata('items')
        const rule = meta.getValidators()?.find(v => v.type === 'listMaxSize')

        expect(rule?.validate([1, 2, 3, 4])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([1, 2, 3, 4, 5])).toBeInstanceOf(CargoFieldError)
    })

    it('should fail when value is not an list', () => {
        const meta = classMeta.getFieldMetadata('items')
        const rule = meta.getValidators()?.find(v => v.type === 'listMaxSize')

        expect(rule?.validate(1)).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate('string')).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
    })

    it('should support custom error message', () => {
        class CustomMsgClass {
            @ListMaxSize(5, 'custom error message')
            field!: any[]
        }

        const meta = new CargoClassMetadata(CustomMsgClass.prototype).getFieldMetadata('field')
        const rule = meta.getValidators()?.find(v => v.type === 'listMaxSize')

        expect(rule?.message).toBe('custom error message')
    })

    it('should not have listMaxSize validator metadata on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidation')
        const rule = meta.getValidators()?.find(v => v.type === 'listMaxSize')

        expect(rule).toBeUndefined()
    })
})
