import { CargoClassMetadata } from '../../src/metadata'
import 'reflect-metadata'
import { body } from '../../src'

describe('getFieldList', () => {
    class Parent {
        @body()
        parentField!: string
    }

    class Child extends Parent {
        @body()
        childField!: string
    }

    const childClassMeta = new CargoClassMetadata(Child.prototype)

    it('should include fields from both parent and child class', () => {
        const fields = childClassMeta.getFieldList()
        expect(fields).toEqual(expect.arrayContaining(['parentField', 'childField']))
        expect(fields.length).toBe(2)
    })

    class EmptyClass { }

    const emptyClassMeta = new CargoClassMetadata(EmptyClass.prototype)
    it('should return empty array if no metadata', () => {
        const fields = emptyClassMeta.getFieldList()
        expect(fields).toEqual([])
    })
})
