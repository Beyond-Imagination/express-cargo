import { CargoFieldError, Prefix } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('prefix decorator', () => {
    class Sample {
        @Prefix('id')
        id1!: string

        id2!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have prefix metadata', () => {
        const meta = classMeta.getFieldMetadata('id1')
        const prefixRule = meta.getValidators()?.find(v => v.type === 'prefix')

        expect(prefixRule).toBeDefined()
        expect(prefixRule?.message).toBe('id1 must start with id')
        expect(prefixRule?.validate('14568')).toBeInstanceOf(CargoFieldError)
        expect(prefixRule?.validate('id14568')).toBeNull()
    })

    it('should not have prefix metadata', () => {
        const meta = classMeta.getFieldMetadata('id2')
        const prefixRule = meta.getValidators()?.find(v => v.type === 'prefix')

        expect(prefixRule).toBeUndefined()
    })
})
