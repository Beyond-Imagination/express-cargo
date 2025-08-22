import { notEqual } from '../../src/validator'
import { CargoClassMetadata } from '../../src/metadata'

describe('notEqual decorator', () => {
    class Sample {
        @notEqual('admin')
        role!: string

        @notEqual(3)
        number1!: number

        number2!: number
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should not have equal validator with string argument', () => {
        const meta = classMeta.getFieldMetadata('role')
        const notEqualRule = meta.getValidators()?.find(v => v.type === 'notEqual')

        expect(notEqualRule).toBeDefined()
        expect(notEqualRule?.message).toBe('role must not be equal to admin')
        expect(notEqualRule?.validate('member')).toBe(true)
        expect(notEqualRule?.validate('admin')).toBe(false)
    })

    it('should not have equal validator with number argument', () => {
        const meta = classMeta.getFieldMetadata('number1')
        const notEqualRule = meta.getValidators()?.find(v => v.type === 'notEqual')

        expect(notEqualRule).toBeDefined()
        expect(notEqualRule?.message).toBe('number1 must not be equal to 3')
        expect(notEqualRule?.validate(100)).toBe(true)
        expect(notEqualRule?.validate(3)).toBe(false)
        expect(notEqualRule?.validate(3.0)).toBe(false)
        expect(notEqualRule?.validate('3')).toBe(true)
    })

    it('should not have equal validator when not decorated', () => {
        const meta = classMeta.getFieldMetadata('number2')
        const notEqualRule = meta.getValidators()?.find(v => v.type === 'notEqual')

        expect(notEqualRule).toBeUndefined()
    })
})
