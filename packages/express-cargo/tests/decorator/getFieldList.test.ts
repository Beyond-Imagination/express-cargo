import { getFieldList } from '../../src/metadata'
import 'reflect-metadata'
import { body } from '../../src'

describe('getFieldList', () => {
    class Parent {
        @body()
        parentField: string
    }

    class Child extends Parent {
        @body()
        childField: string
    }

    it('should include fields from both parent and child class', () => {
        const fields = getFieldList(Child.prototype)
        expect(fields).toEqual(expect.arrayContaining(['parentField', 'childField']))
        expect(fields.length).toBe(2)
    })

    class EmptyClass {}

    it('should return empty array if no metadata', () => {
        const fields = getFieldList(EmptyClass.prototype)
        expect(fields).toEqual([])
    })
})
