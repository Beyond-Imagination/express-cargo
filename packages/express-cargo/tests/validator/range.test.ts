import { CargoFieldError, Range } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('range decorator', () => {
    class Sample {
        @Range(5, 15)
        number1!: number;

        number2!: number;
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have range validator metadata', () => {
        const meta = classMeta.getFieldMetadata('number1')
        const rangeRule = meta.getValidators()?.find(v => v.type === 'range')

        expect(rangeRule).toBeDefined();
        expect(rangeRule?.message).toBe('number1 must be between 5 and 15');
        expect(rangeRule?.validate(4)).toBeInstanceOf(CargoFieldError);
        expect(rangeRule?.validate(10)).toBeNull();
        expect(rangeRule?.validate(16)).toBeInstanceOf(CargoFieldError);

        expect(rangeRule?.validate(16)).toBeInstanceOf(CargoFieldError);
        expect(rangeRule?.validate('not a number')).toBeInstanceOf(CargoFieldError);
    });

    it('should not have range validator metadata', () => {
        const meta = classMeta.getFieldMetadata('number2')
        const rangeRule = meta.getValidators()?.find(v => v.type === 'range')

        expect(rangeRule).toBeUndefined();
    });
})
