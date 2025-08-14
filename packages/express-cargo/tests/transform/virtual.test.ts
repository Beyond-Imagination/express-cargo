import { virtual } from '../../src/transform'
import { CargoClassMetadata } from '../../src/metadata'

describe('virtual decorator', () => {
    class Sample {
        firstName!: string
        lastName!: string
        age!: number

        @virtual(['firstName', 'lastName'], (firstName, lastName) => `${firstName} ${lastName}`)
        fullName!: string

        @virtual(['age'], age => (age >= 18 ? 'Adult' : 'Minor'))
        ageGroup!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have virtual metadata for the decorated fields', () => {
        const fullNameMeta = classMeta.getFieldMetadata('fullName')
        const ageGroupMeta = classMeta.getFieldMetadata('ageGroup')

        expect(fullNameMeta.isVirtual()).toBe(true)
        expect(ageGroupMeta.isVirtual()).toBe(true)

        const firstNameMeta = classMeta.getFieldMetadata('firstName')
        expect(firstNameMeta.isVirtual()).toBe(false)
    })

    it('should correctly store computed fields and the transformer', () => {
        const fullNameMeta = classMeta.getFieldMetadata('fullName')

        expect(fullNameMeta.getComputedFields()).toEqual(['firstName', 'lastName'])

        const transformer = fullNameMeta.getVirtualTransformer()
        expect(transformer).toBeDefined()

        expect(transformer!('John', 'Doe')).toBe('John Doe')
    })

    it('should apply the transformation correctly for a single computed field', () => {
        const ageGroupMeta = classMeta.getFieldMetadata('ageGroup')
        expect(ageGroupMeta.getComputedFields()).toEqual(['age'])

        const transformer = ageGroupMeta.getVirtualTransformer()
        expect(transformer).toBeDefined()

        expect(transformer!(17)).toBe('Minor')
        expect(transformer!(25)).toBe('Adult')
    })
})