import { min } from '../../src/validator'
import { getFieldMetadata } from '../../src/metadata'

describe('min decorator', () => {
    class Sample {
        @min(10)
        number1!: number

        number2!: number
    }

    it('should have min validator metadata', () => {
        const meta = getFieldMetadata(Sample.prototype, 'number1')
        const minRule = meta.validators?.find(v => v.type === 'min')

        expect(minRule).toBeDefined()
        expect(minRule?.message).toBe('number1 must be >= 10')
        expect(minRule?.validate(5)).toBe(false)
        expect(minRule?.validate(15)).toBe(true)
    })

    it('should not have min validator metadata', () => {
        const meta = getFieldMetadata(Sample.prototype, 'number2')
        const minRule = meta.validators?.find(v => v.type === 'min')

        expect(minRule).toBeUndefined()
    })
})
