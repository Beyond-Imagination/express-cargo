import { Optional } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('optional decorator', () => {
    class Sample {
        @Optional()
        field1?: string

        field2?: number
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should mark field1 as optional in metadata', () => {
        const meta = classMeta.getFieldMetadata('field1')
        expect(meta.getOptional()).toBe(true)
    })

    it('should not mark field2 as optional in metadata', () => {
        const meta = classMeta.getFieldMetadata('field2')
        expect(meta.getOptional()).toBe(false)
    })
})
