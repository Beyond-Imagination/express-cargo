import { defaultValue } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('default decorator', () => {
    class Sample {
        @defaultValue('default')
        field1?: string

        @defaultValue(3)
        field2?: string

        @defaultValue(5)
        field3?: number

        field4?: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should set field1 as default value', () => {
        const meta = classMeta.getFieldMetadata('field1')
        expect(meta.getDefault()).toEqual('default')
    })

    it('should set field2 as default value', () => {
        const meta = classMeta.getFieldMetadata('field2')
        expect(meta.getDefault()).toEqual(3)
    })

    it('should set field3 as default value', () => {
        const meta = classMeta.getFieldMetadata('field3')
        expect(meta.getDefault()).toEqual(5)
    })

    it('should not set field4 as default value', () => {
        const meta = classMeta.getFieldMetadata('field4')
        expect(meta.getDefault()).toBeUndefined()
    })
})
