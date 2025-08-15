import { regexp } from '../../src/validator'
import { CargoClassMetadata } from '../../src/metadata'

describe('regexp decorator', () => {
    class Sample {
        @regexp(/ab+c/, "Does not match regexp")
        string1!: string

        string2!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have regex metadata', () => {
        const meta = classMeta.getFieldMetadata('string1')
        const regexpRule = meta.getValidators()?.find(v => v.type === 'regexp')

        expect(regexpRule).toBeDefined()
        expect(regexpRule?.message).toBe('Does not match regexp')
        expect(regexpRule?.validate('abc')).toBe(true)
        expect(regexpRule?.validate('abbc')).toBe(true)
        expect(regexpRule?.validate('ac')).toBe(false)
        expect(regexpRule?.validate('abbb')).toBe(false)
        expect(regexpRule?.validate(2)).toBe(false)
    })

    it('should not have regex metadata', () => {
        const meta = classMeta.getFieldMetadata('string2')
        const regexpRule = meta.getValidators()?.find(v => v.type === 'regexp')

        expect(regexpRule).toBeUndefined()
    })
})
