import { optional } from '../../src/decorators'
import { getFieldMetadata } from '../../src/metadata'

describe('optional decorator', () => {
    class Sample {
        @optional()
        field1?: string

        field2?: number
    }

     it('should mark field1 as optional in metadata', () => {
        const meta = getFieldMetadata(Sample.prototype, 'field1')
        expect(meta.optional).toBe(true)
    })

    it('should not mark field2 as optional in metadata', () => {
        const meta = getFieldMetadata(Sample.prototype, 'field2')
        expect(meta.optional).toBeUndefined()
    })
})