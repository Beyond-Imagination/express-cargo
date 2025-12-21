import { CargoFieldError, Without } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('Without decorator', () => {
    const TARGET_FIELD = 'fieldA'
    const RELATED_FIELD = 'fieldB'
    class Sample {
        @Without('fieldB')
        fieldA!: string

        fieldB!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have "without" rule metadata registered correctly', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const WithoutRule = meta.getValidators()?.find(v => v.type === 'without')

        expect(WithoutRule).toBeDefined()
        expect(WithoutRule?.type).toBe('without')
        expect(WithoutRule?.message).toBe(`fieldA cannot exist with fieldB`)
    })

    it('should not have "without" metadata on unrelated fields', () => {
        const meta = classMeta.getFieldMetadata('fieldB')
        const WithoutRule = meta.getValidators()?.find(v => v.type === 'without')

        expect(WithoutRule).toBeUndefined()
    })

    it('Case 1: Should fail when both fields are Truthy', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const WithoutRule = meta.getValidators()?.find(v => v.type === 'without')
        const instance = { [TARGET_FIELD]: 'ValueA', [RELATED_FIELD]: 'ValueB' }
        const result = WithoutRule?.validate(instance[TARGET_FIELD], instance)

        expect(result).toBeInstanceOf(CargoFieldError)
    })

    it('Case 2a: Should pass when fieldA is Truthy but fieldB is Falsy', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const WithoutRule = meta.getValidators()?.find(v => v.type === 'without')
        const instance = { [TARGET_FIELD]: 'ValueA', [RELATED_FIELD]: '' }
        const result = WithoutRule?.validate(instance[TARGET_FIELD], instance)

        expect(result).toBeNull()
    })

    it('Case 2b: Should pass when fieldA is Truthy but fieldB is missing from instance', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const WithoutRule = meta.getValidators()?.find(v => v.type === 'without')
        const instance = { [TARGET_FIELD]: 'ValueA' }
        const result = WithoutRule?.validate(instance[TARGET_FIELD], instance)

        expect(result).toBeNull()
    })

    it('Case 3: Should pass when fieldA is Falsy (e.g., undefined or null) but fieldB is Truthy', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const WithoutRule = meta.getValidators()?.find(v => v.type === 'without')
        const instance = { [TARGET_FIELD]: '', [RELATED_FIELD]: 'ValueB' }
        const result = WithoutRule?.validate(instance[TARGET_FIELD], instance)

        expect(result).toBeNull()
    })

    it('Case 4: Should pass when both fields are Falsy (e.g., undefined or null)', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const WithoutRule = meta.getValidators()?.find(v => v.type === 'without')
        const instance = { [TARGET_FIELD]: undefined, [RELATED_FIELD]: undefined }
        const result = WithoutRule?.validate(instance[TARGET_FIELD], instance)

        expect(result).toBeNull()
    })

    it('Case 5: Should pass when instance is undefined', () => {
        const meta = classMeta.getFieldMetadata(TARGET_FIELD)
        const WithoutRule = meta.getValidators()?.find(v => v.type === 'without')
        const instance = undefined
        const result = WithoutRule?.validate('ValueA', instance)

        expect(result).toBeInstanceOf(CargoFieldError)
    })
})
