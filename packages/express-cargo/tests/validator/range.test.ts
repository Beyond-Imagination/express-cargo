import {range} from '../../src/validator';
import { CargoClassMetadata } from '../../src/metadata'

describe('range decorator', () => {
    class Sample {
        @range(5, 15)
        number1!: number;

        number2!: number;
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have range validator metadata', () => {
        const meta = classMeta.getFieldMetadata('number1')
        const rangeRule = meta.getValidators()?.find(v => v.type === 'range')

        expect(rangeRule).toBeDefined();
        expect(rangeRule?.message).toBe('number1 must be between 5 and 15');
        expect(rangeRule?.validate(4)).toBe(false);
        expect(rangeRule?.validate(10)).toBe(true);
        expect(rangeRule?.validate(16)).toBe(false);

        expect(rangeRule?.validate(16)).toBe(false);
        expect(rangeRule?.validate('not a number')).toBe(false);
    });

    it('should not have range validator metadata', () => {
        const meta = classMeta.getFieldMetadata('number2')
        const rangeRule = meta.getValidators()?.find(v => v.type === 'range')

        expect(rangeRule).toBeUndefined();
    });
})
