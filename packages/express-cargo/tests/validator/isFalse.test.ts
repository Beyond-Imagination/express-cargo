import { isFalse } from '../../src/validator'
import { getFieldMetadata } from '../../src/metadata'

describe('isFalse decorator', () => {
    class Sample {
        @isFalse()
        booleanValue!: boolean

        noValidatorValue!: boolean
    }

    it('should have isFalse validator', () => {
        const meta = getFieldMetadata(Sample.prototype, 'booleanValue')
        const isFalseRule = meta.validators?.find(v => v.type === 'isFalse')

        expect(isFalseRule).toBeDefined()
        expect(isFalseRule?.message).toBe('booleanValue must be false')
        expect(isFalseRule?.validate(true)).toBe(false)
        expect(isFalseRule?.validate(false)).toBe(true)
    })

    it('should not have isFalse validator', () => {
        const meta = getFieldMetadata(Sample.prototype, 'noValidatorValue')
        const isFalseRule = meta.validators?.find(v => v.type === 'isFalse')

        expect(isFalseRule).toBeUndefined()
    })
})
