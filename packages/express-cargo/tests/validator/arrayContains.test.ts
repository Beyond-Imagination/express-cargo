import { ArrayContains, Body, CargoFieldError } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('ArrayContains Validator', () => {
    class TestClass {
        @Body()
        @ArrayContains(
            ['hello', 'world'],
            (expected, actual) => typeof actual === 'string' && actual.toLowerCase() === expected.toLowerCase()
        )
        strings!: string[]

        @Body()
        @ArrayContains(
            [1, 2],
            (expected, actual) => Math.abs(actual - expected) <= 1
        )
        numbers!: number[]

        @Body()
        @ArrayContains([{ id: 1 }, { id: 2 }])
        objects!: object[]

        @Body()
        @ArrayContains([new Date('2024-01-01'), new Date('2024-06-01')])
        dates!: Date[]

        @ArrayContains([1, { id: 1 }, new Date('2024-01-01')])
        mixed!: any[]

        @Body()
        noValidation!: number[]
    }

    const classMeta = new CargoClassMetadata(TestClass.prototype)

    it('should pass when comparator returns true for all expected values', () => {
        const meta = classMeta.getFieldMetadata('strings')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate(['HELLO', 'WORLD'])).toBeNull()
        expect(rule?.validate(['Hello', 'World', 'extra'])).toBeNull()
    })

    it('should fail when comparator returns false for any expected value', () => {
        const meta = classMeta.getFieldMetadata('strings')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate(['HELLO'])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([])).toBeInstanceOf(CargoFieldError)
    })

    it('should have arrayContains validator metadata', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule).toBeDefined()
    })

    it('should delegate primitive comparison to comparator', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate([1, 2])).toBeNull()
        expect(rule?.validate([0, 3])).toBeNull()
        expect(rule?.validate([5, 6])).toBeInstanceOf(CargoFieldError)
    })

    it('should fail validation when array is missing required primitive values', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate([5, 6])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([])).toBeInstanceOf(CargoFieldError)
    })

    it('should pass validation when array contains all required objects', () => {
        const meta = classMeta.getFieldMetadata('objects')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate([{ id: 1 }, { id: 2 }])).toBeNull()
        expect(rule?.validate([{ id: 1 }, { id: 2 }, { id: 3 }])).toBeNull()
    })

    it('should fail validation when array is missing required objects', () => {
        const meta = classMeta.getFieldMetadata('objects')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate([{ id: 1 }])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([{ id: 3 }])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([])).toBeInstanceOf(CargoFieldError)
    })

    it('should pass validation when array contains all required Date values', () => {
        const meta = classMeta.getFieldMetadata('dates')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate([new Date('2024-01-01'), new Date('2024-06-01')])).toBeNull()
        expect(rule?.validate([new Date('2024-01-01'), new Date('2024-06-01'), new Date('2024-12-01')])).toBeNull()
    })

    it('should fail validation when array is missing required Date values', () => {
        const meta = classMeta.getFieldMetadata('dates')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate([new Date('2024-01-01')])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([new Date('2099-01-01')])).toBeInstanceOf(CargoFieldError)
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

    it('should pass validation when array contains all required mixed type values', () => {
        const meta = classMeta.getFieldMetadata('mixed')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate([1, { id: 1 }, new Date('2024-01-01')])).toBeNull()
        expect(rule?.validate([1, { id: 1 }, new Date('2024-01-01'), 'extra'])).toBeNull()
    })

    it('should fail validation when array is missing any of the required mixed type values', () => {
        const meta = classMeta.getFieldMetadata('mixed')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule?.validate([{ id: 1 }, new Date('2024-01-01')])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([1, new Date('2024-01-01')])).toBeInstanceOf(CargoFieldError)
        expect(rule?.validate([1, { id: 1 }])).toBeInstanceOf(CargoFieldError)
    })

    it('should not have arrayContains validator metadata on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidation')
        const rule = meta.getValidators()?.find(v => v.type === 'arrayContains')

        expect(rule).toBeUndefined()
    })
})
