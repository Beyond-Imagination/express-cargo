import { Array } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

class CustomClass {}

describe('array decorator', () => {
    class Sample {
        @Array(String)
        stringArray!: string[]

        @Array(Number)
        numberArray!: number[]

        @Array(Boolean)
        booleanArray!: boolean[]

        @Array(Date)
        dateArray!: Date[]

        @Array('string')
        stringLiteralArray!: string[]

        @Array(CustomClass)
        customClassArray!: CustomClass[]
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should correctly set array element type to String', () => {
        const meta = classMeta.getFieldMetadata('stringArray')
        expect(meta.getArrayElementType()).toBe(String)
    })

    it('should correctly set array element type to Number', () => {
        const meta = classMeta.getFieldMetadata('numberArray')
        expect(meta.getArrayElementType()).toBe(Number)
    })

    it('should correctly set array element type to Boolean', () => {
        const meta = classMeta.getFieldMetadata('booleanArray')
        expect(meta.getArrayElementType()).toBe(Boolean)
    })

    it('should correctly set array element type to Date', () => {
        const meta = classMeta.getFieldMetadata('dateArray')
        expect(meta.getArrayElementType()).toBe(Date)
    })

    it('should correctly map and set array element type from string literal', () => {
        const meta = classMeta.getFieldMetadata('stringLiteralArray')
        expect(meta.getArrayElementType()).toBe(String)
    })

    it('should correctly set array element type to a custom class', () => {
        const meta = classMeta.getFieldMetadata('customClassArray')
        expect(meta.getArrayElementType()).toBe(CustomClass)
    })
})
