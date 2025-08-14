import { CargoClassMetadata } from '../../src/metadata'
import { virtual } from '../../src'

describe('virtual decorator', () => {
    class Sample {
        firstName!: string
        lastName!: string
        age!: number

        @virtual(req => `${req.body?.firstName} ${req.body?.lastName}`)
        fullName!: string

        @virtual(req => (req.body?.age >= 18 ? 'Adult' : 'Minor'))
        ageGroup!: string
    }

    const mockRequest = (body: any) => ({ body, headers: {} }) as any
    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have virtual metadata for the decorated fields', () => {
        const fullNameMeta = classMeta.getFieldMetadata('fullName')
        const ageGroupMeta = classMeta.getFieldMetadata('ageGroup')

        expect(fullNameMeta.getVirtualTransformer()).toBeDefined()
        expect(ageGroupMeta.getVirtualTransformer()).toBeDefined()

        const firstNameMeta = classMeta.getFieldMetadata('firstName')
        expect(firstNameMeta.getVirtualTransformer()).toBe(undefined)
    })

    it('should correctly store the transformer and execute it with a request object', () => {
        const fullNameMeta = classMeta.getFieldMetadata('fullName')
        const transformer = fullNameMeta.getVirtualTransformer()

        expect(transformer).toBeDefined()
        expect(typeof transformer).toBe('function')

        const req = mockRequest({ firstName: 'John', lastName: 'Doe' })
        expect(transformer!(req)).toBe('John Doe')
    })

    it('should apply the transformation correctly for ageGroup', () => {
        const ageGroupMeta = classMeta.getFieldMetadata('ageGroup')
        const transformer = ageGroupMeta.getVirtualTransformer()

        expect(transformer).toBeDefined()
        expect(typeof transformer).toBe('function')

        const minorReq = mockRequest({ age: 17 })
        expect(transformer!(minorReq)).toBe('Minor')

        const adultReq = mockRequest({ age: 25 })
        expect(transformer!(adultReq)).toBe('Adult')
    })
})