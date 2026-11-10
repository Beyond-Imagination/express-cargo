import { CargoFieldError, NotEqual } from '../../../../src'
import { CargoClassMetadata } from '../../../../src/metadata'

describe('@NotEqual decorator', () => {
    class Sample {
        @NotEqual('admin')
        role!: string

        @NotEqual(3)
        number1!: number

        number2!: number
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should not have equal validator with string argument', () => {
        const meta = classMeta.getFieldMetadata('role')
        const notEqualRule = meta.getValidators()?.find(v => v.type === 'notEqual')

        expect(notEqualRule).toBeDefined()
        expect(notEqualRule?.message).toBe('role must not be equal to admin')
        expect(notEqualRule?.validate('member')).toBeNull()
        expect(notEqualRule?.validate('admin')).toBeInstanceOf(CargoFieldError)
    })

    it('should not have equal validator with number argument', () => {
        const meta = classMeta.getFieldMetadata('number1')
        const notEqualRule = meta.getValidators()?.find(v => v.type === 'notEqual')

        expect(notEqualRule).toBeDefined()
        expect(notEqualRule?.message).toBe('number1 must not be equal to 3')
        expect(notEqualRule?.validate(100)).toBeNull()
        expect(notEqualRule?.validate(3)).toBeInstanceOf(CargoFieldError)
        expect(notEqualRule?.validate(3.0)).toBeInstanceOf(CargoFieldError)
        expect(notEqualRule?.validate('3')).toBeNull()
    })

    it('should not have equal validator when not decorated', () => {
        const meta = classMeta.getFieldMetadata('number2')
        const notEqualRule = meta.getValidators()?.find(v => v.type === 'notEqual')

        expect(notEqualRule).toBeUndefined()
    })
})

describe('@NotEqual with dates', () => {
    class DateDto {
        @NotEqual(new Date('2026-01-01'))
        at!: Date
    }
    const rule = new CargoClassMetadata(DateDto.prototype)
        .getFieldMetadata('at')
        .getValidators()!
        .find(v => v.type === 'notEqual')!

    it('compares a parsed date by its time instead of by reference', () => {
        expect(rule.validate(new Date('2026-01-01'))).toBeInstanceOf(CargoFieldError)
        expect(rule.validate(new Date('2026-01-02'))).toBeNull()
        expect(rule.validate({})).toBeNull()
    })
})
