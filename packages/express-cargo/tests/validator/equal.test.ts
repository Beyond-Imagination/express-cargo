import { CargoFieldError, Equal } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('equal decorator', () => {
    class Sample {
        @Equal('admin')
        role!: string

        @Equal(3)
        number1!: number

        number2!: number
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have equal validator with string argument', () => {
        const meta = classMeta.getFieldMetadata('role')
        const equalRule = meta.getValidators()?.find(v => v.type === 'equal')

        expect(equalRule).toBeDefined()
        expect(equalRule?.message).toBe('role must be equal to admin')
        expect(equalRule?.validate('member')).toBeInstanceOf(CargoFieldError)
        expect(equalRule?.validate('admin')).toBeNull()
    })

    it('should have equal validator with number argument', () => {
        const meta = classMeta.getFieldMetadata('number1')
        const equalRule = meta.getValidators()?.find(v => v.type === 'equal')

        expect(equalRule).toBeDefined()
        expect(equalRule?.message).toBe('number1 must be equal to 3')
        expect(equalRule?.validate(100)).toBeInstanceOf(CargoFieldError)
        expect(equalRule?.validate(3)).toBeNull()
    })

    it('should not have equal validator when not decorated', () => {
        const meta = classMeta.getFieldMetadata('number2')
        const equalRule = meta.getValidators()?.find(v => v.type === 'equal')

        expect(equalRule).toBeUndefined()
    })
})
