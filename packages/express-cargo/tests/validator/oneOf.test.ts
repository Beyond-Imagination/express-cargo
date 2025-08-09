import { oneOf } from '../../src/validator'
import { CargoClassMetadata } from '../../src/metadata'

describe('oneOf decorator', () => {
    class Sample {
        @oneOf([10, 20, 30])
        element1!: number

        @oneOf(['foo', 'bar'])
        element2!: string

        element3!: number
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should add oneOf validator to element1', () => {
        const meta = classMeta.getFieldMetadata('element1')
        const validator = meta.getValidators()?.find(v => v.type === 'oneOf')

        expect(validator).toBeDefined()
        expect(validator?.message).toBe('element1 must be one of 10, 20, 30')

        expect(validator?.validate(10)).toBe(true)
        expect(validator?.validate(25)).toBe(false)
        expect(validator?.validate(30)).toBe(true)
    })

    it('should add oneOf validator to element2 with string options', () => {
        const meta = classMeta.getFieldMetadata('element2')
        const validator = meta.getValidators()?.find(v => v.type === 'oneOf')

        expect(validator).toBeDefined()
        expect(validator?.message).toBe('element2 must be one of foo, bar')

        expect(validator?.validate('foo')).toBe(true)
        expect(validator?.validate(10)).toBe(false)
    })

    it('should not have oneOf validator on element3', () => {
        const meta = classMeta.getFieldMetadata('element3')
        const validator = meta.getValidators()?.find(v => v.type === 'oneOf')

        expect(validator).toBeUndefined()
    })
})
