import { notEqual } from '../../src/validator'
import { getFieldMetadata } from '../../src/metadata'

describe('equal decorator', () => {
    class Sample {
        @notEqual('admin')
        role!: string

        @notEqual(3)
        number1!: number

        number2!: number

        @notEqual(null)
        nullValue!: null

        @notEqual(undefined)
        undefinedValue!: undefined
    }

    it('should not have equal validator with string argument', () => {
        const meta = getFieldMetadata(Sample.prototype, 'role')
        const notEqualRule = meta.validators?.find(v => v.type === 'notEqual')

        expect(notEqualRule).toBeDefined()
        expect(notEqualRule?.message).toBe('role must not be equal to admin')
        expect(notEqualRule?.validate('member')).toBe(true)
        expect(notEqualRule?.validate('admin')).toBe(false)
    })

    it('should not have equal validator with number argument', () => {
        const meta = getFieldMetadata(Sample.prototype, 'number1')
        const notEqualRule = meta.validators?.find(v => v.type === 'notEqual')

        expect(notEqualRule).toBeDefined()
        expect(notEqualRule?.message).toBe('number1 must not be equal to 3')
        expect(notEqualRule?.validate(100)).toBe(true)
        expect(notEqualRule?.validate(3)).toBe(false)
        expect(notEqualRule?.validate(3.0)).toBe(false)
        expect(notEqualRule?.validate('3')).toBe(true)
    })

    it('should not have equal validator when not decorated', () => {
        const meta = getFieldMetadata(Sample.prototype, 'number2')
        const notEqualRule = meta.validators?.find(v => v.type === 'notEqual')

        expect(notEqualRule).toBeUndefined()
    })

    it('should not have equal validator with null argument', () => {
        const meta = getFieldMetadata(Sample.prototype, 'nullValue')
        const notEqualRule = meta.validators?.find(v => v.type === 'notEqual')

        expect(notEqualRule).toBeDefined()
        expect(notEqualRule?.message).toBe('nullValue must not be equal to null')

        expect(notEqualRule?.validate('not-null')).toBe(true)
        expect(notEqualRule?.validate(null)).toBe(false)
        expect(notEqualRule?.validate(undefined)).toBe(true)
    })

    it('should not have equal validator with undefined argument', () => {
        const meta = getFieldMetadata(Sample.prototype, 'undefinedValue')
        const equalRule = meta.validators?.find(v => v.type === 'notEqual')

        expect(equalRule).toBeDefined()
        expect(equalRule?.message).toBe('undefinedValue must not be equal to undefined')

        expect(equalRule?.validate('not-undefined')).toBe(true)
        expect(equalRule?.validate(undefined)).toBe(false)
        expect(equalRule?.validate(null)).toBe(true)
    })
})
