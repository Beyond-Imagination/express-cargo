import { Virtual } from '../../src/transform'
import { CargoClassMetadata } from '../../src/metadata'

describe('virtual decorator', () => {
    class Sample {
        firstName!: string
        lastName!: string
        age!: number

        @Virtual((obj: Sample) => `${obj.firstName} ${obj.lastName}`)
        fullName!: string

        @Virtual((obj: Sample) => (obj.age >= 18 ? 'Adult' : 'Minor'))
        ageGroup!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have virtual metadata for the decorated fields', () => {
        const fullNameMeta = classMeta.getFieldMetadata('fullName')
        const ageGroupMeta = classMeta.getFieldMetadata('ageGroup')

        expect(fullNameMeta.getVirtualTransformer()).toBeDefined()
        expect(ageGroupMeta.getVirtualTransformer()).toBeDefined()

        const firstNameMeta = classMeta.getFieldMetadata('firstName')
        expect(firstNameMeta.getVirtualTransformer()).toBeUndefined()
    })

    it('should correctly store the transformer and use the object', () => {
        const fullNameMeta = classMeta.getFieldMetadata('fullName')
        const transformer = fullNameMeta.getVirtualTransformer()

        expect(transformer).toBeDefined()

        const testObject = { firstName: 'John', lastName: 'Doe' }
        expect(transformer!(testObject)).toBe('John Doe')
    })

    it('should apply the transformation correctly for a single computed field', () => {
        const ageGroupMeta = classMeta.getFieldMetadata('ageGroup')
        const transformer = ageGroupMeta.getVirtualTransformer()
        expect(transformer).toBeDefined()

        const testObjectMinor = { age: 17 }
        const testObjectAdult = { age: 25 }

        expect(transformer!(testObjectMinor)).toBe('Minor')
        expect(transformer!(testObjectAdult)).toBe('Adult')
    })
})
