import { Type } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

class ChildA {
    a = 1
}
class ChildB {
    b = 2
}
class Parent {
    type!: string
}

describe('Type decorator', () => {
    class Sample {
        // Simple Thunk for single object
        @Type(() => ChildA)
        singleObject!: ChildA

        // Array with Thunk
        @Type(() => ChildB)
        objectArray!: ChildB[]

        // Dynamic Resolver
        @Type((data: any) => (data.type === 'A' ? ChildA : ChildB))
        dynamicObject!: ChildA | ChildB

        // Structural Discriminator
        @Type(() => Parent, {
            discriminator: {
                property: 'type',
                subTypes: [
                    { name: 'A', value: ChildA },
                    { name: 'B', value: ChildB },
                ],
            },
        })
        polymorphicArray!: Parent[]
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should correctly set TypeInfo for a simple Thunk', () => {
        const meta = classMeta.getFieldMetadata('singleObject')
        const typeFn = meta.getTypeFn()
        expect(typeof typeFn).toBe('function')
        expect((typeFn as any)()).toBe(ChildA)
    })

    it('should auto-set array element type when used on an Array with a Thunk', () => {
        const meta = classMeta.getFieldMetadata('objectArray')

        expect(meta.getTypeFn()).toBeDefined()
        expect(meta.getArrayElementType()).toBe(ChildB)
    })

    it('should correctly set TypeInfo for a dynamic Resolver', () => {
        const meta = classMeta.getFieldMetadata('dynamicObject')
        const typeFn = meta.getTypeFn()

        expect(typeFn!({ type: 'A' })).toBe(ChildA)
        expect(typeFn!({ type: 'B' })).toBe(ChildB)
    })

    it('should correctly store discriminator options', () => {
        const meta = classMeta.getFieldMetadata('polymorphicArray')
        const options = meta.getTypeOptions()

        expect(options?.discriminator).toBeDefined()
        expect(options?.discriminator?.property).toBe('type')
        expect(options?.discriminator?.subTypes).toContainEqual({ name: 'A', value: ChildA })
    })

    it('should not set ArrayElementType for non-thunk (Resolver) even if it is an array', () => {
        const meta = classMeta.getFieldMetadata('dynamicObject')
        expect(meta.getArrayElementType()).toBeUndefined()
    })
})
