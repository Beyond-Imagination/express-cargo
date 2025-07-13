import { optional } from '../../src/validator'
import { getFieldMetadata } from '../../src/metadata'

describe('optinal decorator', () => {
    class Sample {
        @optional()
        field1?: string

        field2?: number
    }

     it('should have optional validator metadata', () => {
        const meta = getFieldMetadata(Sample.prototype, 'field1')
        const optionalRule = meta.validators?.find(v => v.type === 'optional')

        expect(optionalRule).toBeDefined()
        expect(optionalRule?.message).toBe('field1 is optional')
        expect(optionalRule?.validate(undefined)).toBe(true)
        expect(optionalRule?.validate(null)).toBe(true)
        expect(optionalRule?.validate('something')).toBe(true)
    })

    it('should not have optional validator metadata', () => {
        const meta = getFieldMetadata(Sample.prototype, 'field2')
        const optionalRule = meta.validators?.find(v => v.type === 'optional')

        expect(optionalRule).toBeUndefined()
    })
})