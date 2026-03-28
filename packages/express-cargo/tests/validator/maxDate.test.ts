import { CargoFieldError, MaxDate } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('maxDate decorator', () => {
    const maxDate = new Date('2099-12-31')

    class Sample {
        @MaxDate(maxDate)
        date!: Date

        noValidatorValue!: Date
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)
    const meta = classMeta.getFieldMetadata('date')
    const maxDateRule = meta.getValidators()?.find(v => v.type === 'maxDate')

    it('should have maxDate validator', () => {
        expect(maxDateRule).toBeDefined()
    })

    it('should pass for dates on or before the maximum', () => {
        expect(maxDateRule!.validate(new Date('2099-12-31'))).toBeNull()
        expect(maxDateRule!.validate(new Date('2000-01-01'))).toBeNull()
        expect(maxDateRule!.validate(new Date('2099-12-30'))).toBeNull()
    })

    it('should fail for dates after the maximum', () => {
        expect(maxDateRule!.validate(new Date('2100-01-01'))).toBeInstanceOf(CargoFieldError)
        expect(maxDateRule!.validate(new Date('9999-12-31'))).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for non-Date values', () => {
        expect(maxDateRule!.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(maxDateRule!.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(maxDateRule!.validate('2025-01-01')).toBeInstanceOf(CargoFieldError)
        expect(maxDateRule!.validate(123456789)).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for invalid Date objects', () => {
        expect(maxDateRule!.validate(new Date('invalid'))).toBeInstanceOf(CargoFieldError)
    })

    it('should not have maxDate validator on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const rule = meta.getValidators()?.find(v => v.type === 'maxDate')
        expect(rule).toBeUndefined()
    })

    it('should support function as max date', () => {
        class DynamicMax {
            @MaxDate(() => new Date('2050-01-01'))
            date!: Date
        }

        const dynamicMeta = new CargoClassMetadata(DynamicMax.prototype)
        const rule = dynamicMeta.getFieldMetadata('date').getValidators()?.find(v => v.type === 'maxDate')

        expect(rule!.validate(new Date('2049-12-31'))).toBeNull()
        expect(rule!.validate(new Date('2050-01-02'))).toBeInstanceOf(CargoFieldError)
    })

    it('should support custom error message', () => {
        class CustomMessage {
            @MaxDate(maxDate, 'custom error')
            date!: Date
        }

        const customMeta = new CargoClassMetadata(CustomMessage.prototype)
        const rule = customMeta.getFieldMetadata('date').getValidators()?.find(v => v.type === 'maxDate')

        const error = rule!.validate(new Date('2100-01-01'))
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.message).toBe('custom error')
    })
})
