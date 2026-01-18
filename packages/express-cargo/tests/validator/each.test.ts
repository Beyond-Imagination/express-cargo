import { CargoFieldError, Each, Min } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('Each decorator', () => {
    class Sample {
        @Each(Min(10))
        numbers!: number[]

        @Each((val: string) => val.startsWith('a'))
        strings!: string[]
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should validate each element with existing decorator', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'each')
        expect(rule).toBeDefined()

        // Valid
        expect(rule?.validate([10, 20])).toBeNull()

        // Invalid
        const error = rule?.validate([10, 5])
        expect(error).toBeInstanceOf(CargoFieldError)

        // Check if field name includes index
        expect(error?.field).toBe('numbers[1]')
        expect(error?.message).toContain('must be >= 10')
    })

    it('should validate each element with custom function', () => {
        const meta = classMeta.getFieldMetadata('strings')
        const rule = meta.getValidators()?.find(v => v.type === 'each')
        expect(rule).toBeDefined()

        // Valid
        expect(rule?.validate(['abc', 'apple'])).toBeNull()

        // Invalid
        const error = rule?.validate(['abc', 'banana'])
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.field).toBe('strings[1]')
    })

    it('should ignore non-array values', () => {
        const meta = classMeta.getFieldMetadata('numbers')
        const rule = meta.getValidators()?.find(v => v.type === 'each')
        expect(rule?.validate(123)).toBeNull()
    })
})
