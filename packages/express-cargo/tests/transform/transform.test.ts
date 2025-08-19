import { transform } from '../../src/transform'
import { CargoClassMetadata } from '../../src/metadata'

describe('transform decorator', () => {
    class Sample {
        @transform(value => value.toUpperCase())
        text!: string

        @transform(value => value * 2)
        number!: number

        @transform(value => value.trim())
        message!: string

        untransformedValue!: string

        @transform(value => value === 'on')
        checkbox: boolean
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have a transformer for the decorated fields', () => {
        const textMeta = classMeta.getFieldMetadata('text')
        const numberMeta = classMeta.getFieldMetadata('number')

        expect(textMeta.getTransformer()).toBeDefined()
        expect(numberMeta.getTransformer()).toBeDefined()

        const untransformedMeta = classMeta.getFieldMetadata('untransformedValue')
        expect(untransformedMeta.getTransformer()).toBeUndefined()
    })

    it('should apply the transformation correctly for string values', () => {
        const meta = classMeta.getFieldMetadata('text')
        const transformer = meta.getTransformer()

        expect(transformer).toBeDefined()
        expect(transformer('hello world')).toBe('HELLO WORLD')
    })

    it('should apply the transformation correctly for number values', () => {
        const meta = classMeta.getFieldMetadata('number')
        const transformer = meta.getTransformer()

        expect(transformer).toBeDefined()
        expect(transformer(10)).toBe(20)
    })

    it('should apply the transformation correctly for string trim', () => {
        const meta = classMeta.getFieldMetadata('message')
        const transformer = meta.getTransformer()

        expect(transformer).toBeDefined()
        expect(transformer!('  some message  ')).toBe('some message')
    })

    it('should apply the transformation correctly for boolean', () => {
        const meta = classMeta.getFieldMetadata('checkbox')
        const transformer = meta.getTransformer()

        expect(transformer).toBeDefined()
        expect(transformer('on')).toBe(true)
        expect(transformer('off')).toBe(false)
    })
})
