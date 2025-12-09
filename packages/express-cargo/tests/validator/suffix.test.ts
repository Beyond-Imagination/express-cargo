import { CargoFieldError, Suffix } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('suffix decorator', () => {
    class Sample {
        @Suffix('.com')
        link1!: string

        link2!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have suffix metadata', () => {
        const meta = classMeta.getFieldMetadata('link1')
        const suffixRule = meta.getValidators()?.find(v => v.type === 'suffix')

        expect(suffixRule).toBeDefined()
        expect(suffixRule?.message).toBe('link1 must end with .com')
        expect(suffixRule?.validate('abc')).toBeInstanceOf(CargoFieldError)
        expect(suffixRule?.validate('abc.com')).toBeNull()
    })

    it('should not have suffix metadata', () => {
        const meta = classMeta.getFieldMetadata('link2')
        const suffixRule = meta.getValidators()?.find(v => v.type === 'suffix')

        expect(suffixRule).toBeUndefined()
    })
})
