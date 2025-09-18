import { CargoFieldError, oneOf } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('oneOf decorator', () => {
    class Sample {
        @oneOf([10, 20, 30] as const)
        element1!: number

        @oneOf(['foo', 'bar'] as const)
        element2!: number

        element3!: number

        @oneOf([] as const)
        element4!: number

        @oneOf([1, 'a'] as const)
        element5!: 1 | 'a'
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should add oneOf validator to element1', () => {
        const meta = classMeta.getFieldMetadata('element1')
        const validator = meta.getValidators()?.find(v => v.type === 'oneOf')

        expect(validator).toBeDefined()
        expect(validator?.message).toBe('element1 must be one of 10, 20, 30')

        expect(validator?.validate(10)).toBeNull()
        expect(validator?.validate(25)).toBeInstanceOf(CargoFieldError)
        expect(validator?.validate(30)).toBeNull()
        expect(validator?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(validator?.validate(undefined)).toBeInstanceOf(CargoFieldError)
    })

    it('should add oneOf validator to element2 with string options', () => {
        const meta = classMeta.getFieldMetadata('element2')
        const validator = meta.getValidators()?.find(v => v.type === 'oneOf')

        expect(validator).toBeDefined()
        expect(validator?.message).toBe('element2 must be one of foo, bar')

        expect(validator?.validate('foo')).toBeNull()
        expect(validator?.validate('loo')).toBeInstanceOf(CargoFieldError)
    })

    it('should not have oneOf validator on element3', () => {
        const meta = classMeta.getFieldMetadata('element3')
        const validator = meta.getValidators()?.find(v => v.type === 'oneOf')

        expect(validator).toBeUndefined()
    })

    it('should not validate anything on element4', () => {
        const meta = classMeta.getFieldMetadata('element4')
        const validator = meta.getValidators()?.find(v => v.type === 'oneOf')

        expect(validator).toBeDefined()

        expect(validator?.validate('foo')).toBeInstanceOf(CargoFieldError)
        expect(validator?.validate(10)).toBeInstanceOf(CargoFieldError)
    })

    it('should validate mixed type of elements on element5', () => {
        const meta = classMeta.getFieldMetadata('element5')
        const validator = meta.getValidators()?.find(v => v.type === 'oneOf')

        expect(validator).toBeDefined()

        expect(validator?.validate('a')).toBeNull()
        expect(validator?.validate(1)).toBeNull()
        expect(validator?.validate(2)).toBeInstanceOf(CargoFieldError)
    })
})
