import { CargoFieldError, MinDate } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('minDate decorator', () => {
    const minDate = new Date('2000-01-01')

    class Sample {
        @MinDate(minDate)
        date!: Date

        noValidatorValue!: Date
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)
    const meta = classMeta.getFieldMetadata('date')
    const minDateRule = meta.getValidators()?.find(v => v.type === 'minDate')

    it('should have minDate validator', () => {
        expect(minDateRule).toBeDefined()
    })

    it('should pass for dates on or after the minimum', () => {
        expect(minDateRule!.validate(new Date('2000-01-01'))).toBeNull()
        expect(minDateRule!.validate(new Date('2025-01-01'))).toBeNull()
        expect(minDateRule!.validate(new Date('2000-01-02'))).toBeNull()
    })

    it('should fail for dates before the minimum', () => {
        expect(minDateRule!.validate(new Date('1999-12-31'))).toBeInstanceOf(CargoFieldError)
        expect(minDateRule!.validate(new Date('1900-01-01'))).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for non-Date values', () => {
        expect(minDateRule!.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(minDateRule!.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(minDateRule!.validate('2025-01-01')).toBeInstanceOf(CargoFieldError)
        expect(minDateRule!.validate(123456789)).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for invalid Date objects', () => {
        expect(minDateRule!.validate(new Date('invalid'))).toBeInstanceOf(CargoFieldError)
    })

    it('should not have minDate validator on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const rule = meta.getValidators()?.find(v => v.type === 'minDate')
        expect(rule).toBeUndefined()
    })

    it('should support function as min date', () => {
        class DynamicMin {
            @MinDate(() => new Date('2020-01-01'))
            date!: Date
        }

        const dynamicMeta = new CargoClassMetadata(DynamicMin.prototype)
        const rule = dynamicMeta.getFieldMetadata('date').getValidators()?.find(v => v.type === 'minDate')

        expect(rule!.validate(new Date('2021-01-01'))).toBeNull()
        expect(rule!.validate(new Date('2019-12-31'))).toBeInstanceOf(CargoFieldError)
    })

    it('should support custom error message', () => {
        class CustomMessage {
            @MinDate(minDate, 'custom error')
            date!: Date
        }

        const customMeta = new CargoClassMetadata(CustomMessage.prototype)
        const rule = customMeta.getFieldMetadata('date').getValidators()?.find(v => v.type === 'minDate')

        const error = rule!.validate(new Date('1999-01-01'))
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.message).toBe('custom error')
    })
})
