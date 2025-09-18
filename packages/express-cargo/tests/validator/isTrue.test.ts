import { CargoFieldError, isTrue } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('isTrue decorator', () => {
    class Sample {
        @isTrue()
        booleanValue!: boolean

        noValidatorValue!: boolean
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have isTrue validator', () => {
        const meta = classMeta.getFieldMetadata('booleanValue')
        const isTrueRule = meta.getValidators()?.find(v => v.type === 'isTrue')

        expect(isTrueRule).toBeDefined()
        expect(isTrueRule?.message).toBe('booleanValue must be true')
        expect(isTrueRule?.validate(true)).toBeNull()
        expect(isTrueRule?.validate(false)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have isTrue validator', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const isTrueRule = meta.getValidators()?.find(v => v.type === 'isTrue')

        expect(isTrueRule).toBeUndefined()
    })
})
