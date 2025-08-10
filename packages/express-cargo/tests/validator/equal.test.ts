import { equal } from '../../src/validator'
import { CargoClassMetadata } from '../../src/metadata'

describe('equal decorator', () => {
    class Sample {
        @equal('admin')
        role!: string

        @equal(3)
        number1!: number

        number2!: number

        @equal(null)
        nullValue!: null

        @equal(undefined)
        undefinedValue!: undefined
    }

    const classMeta = new CargoClassMetadata(Sample)

    it('should have equal validator with string argument', () => {
        const meta = classMeta.getFieldMetadata('role')
        const equalRule = meta.getValidators()?.find(v => v.type === 'equal')

        expect(equalRule).toBeDefined()
        expect(equalRule?.message).toBe('role must be equal to admin')
        expect(equalRule?.validate('member')).toBe(false)
        expect(equalRule?.validate('admin')).toBe(true)
    })

    it('should have equal validator with number argument', () => {
        const meta = classMeta.getFieldMetadata('number1')
        const equalRule = meta.getValidators()?.find(v => v.type === 'equal')

        expect(equalRule).toBeDefined()
        expect(equalRule?.message).toBe('number1 must be equal to 3')
        expect(equalRule?.validate(100)).toBe(false)
        expect(equalRule?.validate(3)).toBe(true)
    })

    it('should not have equal validator when not decorated', () => {
        const meta = classMeta.getFieldMetadata('number2')
        const equalRule = meta.getValidators()?.find(v => v.type === 'equal')

        expect(equalRule).toBeUndefined()
    })

    it('should have equal validator with null argument', () => {
        const meta = classMeta.getFieldMetadata('nullValue')
        const equalRule = meta.getValidators()?.find(v => v.type === 'equal')

        expect(equalRule).toBeDefined()
        expect(equalRule?.message).toBe('nullValue must be equal to null')

        expect(equalRule?.validate('not-null')).toBe(false)
        expect(equalRule?.validate(null)).toBe(true)
        expect(equalRule?.validate(undefined)).toBe(false)
    })

    it('should have equal validator with undefined argument', () => {
        const meta = classMeta.getFieldMetadata('undefinedValue')
        const equalRule = meta.getValidators()?.find(v => v.type === 'equal')

        expect(equalRule).toBeDefined()
        expect(equalRule?.message).toBe('undefinedValue must be equal to undefined')

        expect(equalRule?.validate('not-undefined')).toBe(false)
        expect(equalRule?.validate(undefined)).toBe(true)
        expect(equalRule?.validate(null)).toBe(false)
    })
})
