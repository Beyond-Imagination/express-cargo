import { CargoFieldError, Contains } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('contains decorator', () => {
    class Sample {
        @Contains('hello')
        id1!: string

        id2!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have contains metadata', () => {
        const meta = classMeta.getFieldMetadata('id1')
        const containsRule = meta.getValidators()?.find(v => v.type === 'contains')

        expect(containsRule).toBeDefined()
        expect(containsRule?.message).toBe('id1 must contain hello')
        expect(containsRule?.validate('world')).toBeInstanceOf(CargoFieldError)
        expect(containsRule?.validate('hello world')).toBeNull()
    })

    it('should not have contains metadata', () => {
        const meta = classMeta.getFieldMetadata('id2')
        const containsRule = meta.getValidators()?.find(v => v.type === 'contains')

        expect(containsRule).toBeUndefined()
    })
})