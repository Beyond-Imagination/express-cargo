import { CargoFieldError, With } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('with decorator', () => {
    const TARGET_FIELD = 'fieldA'
    const RELATED_FIELD = 'fieldB'
    class Sample {
        @With('fieldB')
        fieldA!: string

        fieldB!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have "with" rule metadata registered correctly', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const withRule = meta.getValidators()?.find(v => v.type === 'with')

        expect(withRule).toBeDefined()
        expect(withRule?.type).toBe('with')
        expect(withRule?.message).toBe(`fieldA requires fieldB`)
    })

    it('should not have "with" metadata on unrelated fields', () => {
        const meta = classMeta.getFieldMetadata('fieldB')
        const withRule = meta.getValidators()?.find(v => v.type === 'with')

        expect(withRule).toBeUndefined()
    })

    it('Case 1: Should pass when both fields are Truthy', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const withRule = meta.getValidators()?.find(v => v.type === 'with')
        const instance = { [TARGET_FIELD]: 'ValueA', [RELATED_FIELD]: 'ValueB' }
        const result = withRule?.validate(instance[TARGET_FIELD], instance)

        expect(result).toBeNull()
    })

    it('Case 2: Should fail when fieldA is Truthy but fieldB is Falsy', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const withRule = meta.getValidators()?.find(v => v.type === 'with')
        const instance = { [TARGET_FIELD]: 'ValueA', [RELATED_FIELD]: '' }
        const result = withRule?.validate(instance[TARGET_FIELD], instance)

        expect(result).toBeInstanceOf(CargoFieldError)
    })

    it('Case 3: Should pass when fieldA is Falsy but fieldB is Truthy', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const withRule = meta.getValidators()?.find(v => v.type === 'with')
        const instance = { [TARGET_FIELD]: '', [RELATED_FIELD]: 'ValueB' }
        const result = withRule?.validate(instance[TARGET_FIELD], instance)

        expect(result).toBeNull()
    })

    it('Case 4: Should pass when both fields are Falsy (e.g., undefined or null)', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const withRule = meta.getValidators()?.find(v => v.type === 'with')
        const instance = { [TARGET_FIELD]: undefined, [RELATED_FIELD]: undefined }
        const result = withRule?.validate(instance[TARGET_FIELD], instance)

        expect(result).toBeNull()
    })

    it('Case 2b: Should fail when fieldA is Truthy but fieldB is missing from instance', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const withRule = meta.getValidators()?.find(v => v.type === 'with')
        const instance = { [TARGET_FIELD]: 'ValueA' }
        const result = withRule?.validate(instance[TARGET_FIELD], instance)

        expect(result).toBeInstanceOf(CargoFieldError)
    })

    it('Case 5: Should pass safely when instance is undefined', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const withRule = meta.getValidators()?.find(v => v.type === 'with')
        const instance = undefined
        const result = withRule?.validate('ValueA', instance)
        expect(result).toBeInstanceOf(CargoFieldError)
    })
})
