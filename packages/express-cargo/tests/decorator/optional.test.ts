import { optional } from '../../src/decorators'
import { CargoClassMetadata } from '../../src/metadata'

describe('optional decorator', () => {
    class Sample {
        @optional()
        field1?: string

        field2?: number
    }

    const classMeta = new CargoClassMetadata(Sample)

    it('should mark field1 as optional in metadata', () => {
        const meta = classMeta.getFieldMetadata('field1')
        expect(meta.getOptional()).toBe(true)
    })

    it('should not mark field2 as optional in metadata', () => {
        const meta = classMeta.getFieldMetadata('field2')
        expect(meta.getOptional()).toBe(false)
    })
})
