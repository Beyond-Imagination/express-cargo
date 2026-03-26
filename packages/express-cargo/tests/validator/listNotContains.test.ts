import { ListNotContains, Body, CargoFieldError } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('ListNotContains Validator', () => {
    class TestClass {
        @Body()
        @ListNotContains(
            ['hello', 'world'],
            (expected, actual) => typeof actual === 'string' && actual.toLowerCase() === expected.toLowerCase()
        )
        strings!: string[]

        @Body()
        @ListNotContains(
            [1, 2],
            (expected, actual) => Math.abs(actual - expected) <= 1
        )
        numbers!: number[]

        @Body()
        @ListNotContains([{ id: 1 }, { id: 2 }])
        objects!: object[]

        @Body()
        @ListNotContains([new Date('2024-01-01'), new Date('2024-06-01')])
        dates!: Date[]

        @ListNotContains([1, { id: 1 }, new Date('2024-01-01')])
        mixed!: any[]

        @Body()
        noValidation!: number[]
    }

    const classMeta = new CargoClassMetadata(TestClass.prototype)

    it('should pass when comparator returns false for all excluded values', () => {
        const meta = classMeta.getFieldMetadata('strings')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule?.validate(['foo', 'bar'])).toBeNull()
        expect(rule?.validate([])).toBeNull()
    })

    it('should fail when comparator returns true for any excluded value', () => {
        const meta = classMeta.getFieldMetadata('strings')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule?.validate(['HELLO', 'foo'])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate(['WORLD'])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate(['HELLO', 'WORLD'])).toBeInstanceOf(CargoFieldError)
    })

    it('should have listNotContains validator metadata', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule).toBeDefined()
    })

    it('should delegate primitive comparison to comparator', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule?.validate([5, 6])).toBeNull()
        expect(rule?.validate([0, 3])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([1, 2])).toBeInstanceOf(CargoFieldError)
    })

    it('should pass validation when list does not contain excluded primitive values', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule?.validate([5, 6])).toBeNull()
        expect(rule?.validate([])).toBeNull()
    })

    it('should pass validation when list does not contain excluded objects', () => {
        const meta = classMeta.getFieldMetadata('objects')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule?.validate([{ id: 3 }, { id: 4 }])).toBeNull()
        expect(rule?.validate([])).toBeNull()
    })

    it('should fail validation when list contains any excluded objects', () => {
        const meta = classMeta.getFieldMetadata('objects')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule?.validate([{ id: 1 }])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([{ id: 1 }, { id: 2 }])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([{ id: 1 }, { id: 3 }])).toBeInstanceOf(CargoFieldError)
    })

    it('should pass validation when list does not contain excluded Date values', () => {
        const meta = classMeta.getFieldMetadata('dates')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule?.validate([new Date('2099-01-01'), new Date('2099-06-01')])).toBeNull()
        expect(rule?.validate([])).toBeNull()
    })

    it('should fail validation when list contains any excluded Date values', () => {
        const meta = classMeta.getFieldMetadata('dates')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule?.validate([new Date('2024-01-01')])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([new Date('2024-06-01'), new Date('2099-01-01')])).toBeInstanceOf(CargoFieldError)
    })

    it('should fail validation when value is not a list', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule?.validate(1)).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate('string')).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
    })

    it('should pass validation when list does not contain any of the excluded mixed type values', () => {
        const meta = classMeta.getFieldMetadata('mixed')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule?.validate([2, { id: 2 }, new Date('2025-01-01')])).toBeNull()
        expect(rule?.validate([])).toBeNull()
    })

    it('should fail validation when list contains any of the excluded mixed type values', () => {
        const meta = classMeta.getFieldMetadata('mixed')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule?.validate([1, { id: 2 }, new Date('2025-01-01')])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([2, { id: 1 }, new Date('2025-01-01')])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([2, { id: 2 }, new Date('2024-01-01')])).toBeInstanceOf(CargoFieldError)
    })

    it('should not have listNotContains validator metadata on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidation')
        const rule = meta.getValidators()?.find(v => v.type === 'listNotContains')

        expect(rule).toBeUndefined()
    })
})