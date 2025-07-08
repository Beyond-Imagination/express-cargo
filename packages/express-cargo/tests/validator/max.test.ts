import { max } from '../../src/validator'
import { getFieldMetadata } from '../../src/metadata'

describe('max decorator', () => {
    class Sample {
        @max(20)
        number1!: number

        number2!: number
    }

    it('should add max validator metadata', () => {
        const meta = getFieldMetadata(Sample.prototype, 'number1')
        const maxRule = meta.validators?.find(v => v.type === 'max')

        expect(maxRule).toBeDefined()
        expect(maxRule?.message).toBe('number1 must be <= 20')
        expect(maxRule?.validate(25)).toBe(false)
        expect(maxRule?.validate(15)).toBe(true)
    })

    it('should not have max validator metadata', () => {
        const meta = getFieldMetadata(Sample.prototype, 'number2')
        const maxRule = meta.validators?.find(v => v.type === 'max')

        expect(maxRule).toBeUndefined()
    })
})
