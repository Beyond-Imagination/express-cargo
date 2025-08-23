import { equal } from '../../src/validator'
import { CargoClassMetadata } from '../../src/metadata'

describe('equal decorator', () => {
    class Sample {
        @equal('admin')
        role!: string

        @equal(3)
        number1!: number

        number2!: number
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

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
})
