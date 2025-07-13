import { prefix } from '../../src/validator'
import { getFieldMetadata } from '../../src/metadata'

describe('prefix decorator', () => {
    class Sample {
        @prefix('id')
        id1!: string

        id2!: string
    }

    it('should have prefix metadata', () => {
        const meta = getFieldMetadata(Sample.prototype, 'id1')
        const prefixRule = meta.validators?.find(v => v.type === 'prefix')

        expect(prefixRule).toBeDefined()
        expect(prefixRule?.message).toBe('id1 must start with id')
        expect(prefixRule?.validate('14568')).toBe(false)
        expect(prefixRule?.validate('id14568')).toBe(true)
    })

    it('should not have prefix metadata', () => {
        const meta = getFieldMetadata(Sample.prototype, 'id2')
        const prefixRule = meta.validators?.find(v => v.type === 'prefix')

        expect(prefixRule).toBeUndefined()
    })
})
