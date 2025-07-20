import {range} from '../../src/validator';
import {getFieldMetadata} from '../../src/metadata';

describe('range decorator', () => {
    class Sample {
        @range(5, 15)
        number1!: number;

        number2!: number;
    }

    it('should have range validator metadata', () => {
        const meta = getFieldMetadata(Sample.prototype, 'number1');
        const rangeRule = meta.validators?.find(v => v.type === 'range');

        expect(rangeRule).toBeDefined();
        expect(rangeRule?.message).toBe('number1 must be between 5 and 15');
        expect(rangeRule?.validate(4)).toBe(false);
        expect(rangeRule?.validate(10)).toBe(true);
        expect(rangeRule?.validate(16)).toBe(false);
    });

    it('should not have range validator metadata', () => {
        const meta = getFieldMetadata(Sample.prototype, 'number2');
        const rangeRule = meta.validators?.find(v => v.type === 'range');

        expect(rangeRule).toBeUndefined();
    });
})