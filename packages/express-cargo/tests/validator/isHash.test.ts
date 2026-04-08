import { CargoFieldError, IsHash } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('isHash decorator', () => {
    class Sample {
        @IsHash('md5')
        md5Hash!: string

        @IsHash('sha1')
        sha1Hash!: string

        @IsHash('sha256')
        sha256Hash!: string

        @IsHash('sha384')
        sha384Hash!: string

        @IsHash('sha512')
        sha512Hash!: string

        @IsHash('crc32')
        crc32Hash!: string

        @IsHash('crc32b')
        crc32bHash!: string

        noValidatorValue!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    describe('md5', () => {
        const meta = classMeta.getFieldMetadata('md5Hash')
        const rule = meta.getValidators()?.find(v => v.type === 'isHash')

        it('should have isHash validator', () => {
            expect(rule).toBeDefined()
            expect(rule?.message).toBe('md5Hash should be a valid md5 hash')
        })

        it('should pass for valid md5 hash', () => {
            expect(rule!.validate('d41d8cd98f00b204e9800998ecf8427e')).toBeNull()
            expect(rule!.validate('D41D8CD98F00B204E9800998ECF8427E')).toBeNull()
        })

        it('should fail for invalid md5 hash', () => {
            expect(rule!.validate('d41d8cd98f00b204e9800998ecf8427')).toBeInstanceOf(CargoFieldError)
            expect(rule!.validate('d41d8cd98f00b204e9800998ecf8427ez')).toBeInstanceOf(CargoFieldError)
            expect(rule!.validate('not-a-hash')).toBeInstanceOf(CargoFieldError)
            expect(rule!.validate('')).toBeInstanceOf(CargoFieldError)
        })
    })

    describe('sha1', () => {
        const meta = classMeta.getFieldMetadata('sha1Hash')
        const rule = meta.getValidators()?.find(v => v.type === 'isHash')

        it('should pass for valid sha1 hash', () => {
            expect(rule!.validate('da39a3ee5e6b4b0d3255bfef95601890afd80709')).toBeNull()
        })

        it('should fail for invalid sha1 hash', () => {
            expect(rule!.validate('da39a3ee5e6b4b0d3255bfef95601890afd8070')).toBeInstanceOf(CargoFieldError)
            expect(rule!.validate('not-a-hash')).toBeInstanceOf(CargoFieldError)
        })
    })

    describe('sha256', () => {
        const meta = classMeta.getFieldMetadata('sha256Hash')
        const rule = meta.getValidators()?.find(v => v.type === 'isHash')

        it('should pass for valid sha256 hash', () => {
            expect(rule!.validate('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')).toBeNull()
        })

        it('should fail for invalid sha256 hash', () => {
            expect(rule!.validate('e3b0c44298fc1c149afbf4c8996fb924')).toBeInstanceOf(CargoFieldError)
            expect(rule!.validate('not-a-hash')).toBeInstanceOf(CargoFieldError)
        })
    })

    describe('sha384', () => {
        const meta = classMeta.getFieldMetadata('sha384Hash')
        const rule = meta.getValidators()?.find(v => v.type === 'isHash')

        it('should pass for valid sha384 hash', () => {
            expect(rule!.validate('38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b')).toBeNull()
        })

        it('should fail for invalid sha384 hash', () => {
            expect(rule!.validate('38b060a751ac96384cd9327eb1b1e36a')).toBeInstanceOf(CargoFieldError)
        })
    })

    describe('sha512', () => {
        const meta = classMeta.getFieldMetadata('sha512Hash')
        const rule = meta.getValidators()?.find(v => v.type === 'isHash')

        it('should pass for valid sha512 hash', () => {
            expect(rule!.validate('cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e')).toBeNull()
        })

        it('should fail for invalid sha512 hash', () => {
            expect(rule!.validate('cf83e1357eefb8bdf1542850d66d8007')).toBeInstanceOf(CargoFieldError)
        })
    })

    describe('crc32', () => {
        const meta = classMeta.getFieldMetadata('crc32Hash')
        const rule = meta.getValidators()?.find(v => v.type === 'isHash')

        it('should pass for valid crc32 hash', () => {
            expect(rule!.validate('00000000')).toBeNull()
            expect(rule!.validate('cbf43926')).toBeNull()
        })

        it('should fail for invalid crc32 hash', () => {
            expect(rule!.validate('0000000')).toBeInstanceOf(CargoFieldError)
            expect(rule!.validate('cbf439260')).toBeInstanceOf(CargoFieldError)
        })
    })

    describe('crc32b', () => {
        const meta = classMeta.getFieldMetadata('crc32bHash')
        const rule = meta.getValidators()?.find(v => v.type === 'isHash')

        it('should pass for valid crc32b hash', () => {
            expect(rule!.validate('00000000')).toBeNull()
            expect(rule!.validate('cbf43926')).toBeNull()
        })

        it('should fail for invalid crc32b hash', () => {
            expect(rule!.validate('0000000')).toBeInstanceOf(CargoFieldError)
            expect(rule!.validate('cbf439260')).toBeInstanceOf(CargoFieldError)
        })
    })

    it('should fail for non-string values', () => {
        const meta = classMeta.getFieldMetadata('md5Hash')
        const rule = meta.getValidators()?.find(v => v.type === 'isHash')

        expect(rule!.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(rule!.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(rule!.validate(123)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have isHash validator on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const rule = meta.getValidators()?.find(v => v.type === 'isHash')
        expect(rule).toBeUndefined()
    })

    it('should support custom error message', () => {
        class CustomMessage {
            @IsHash('sha256', 'custom error')
            hash!: string
        }

        const customMeta = new CargoClassMetadata(CustomMessage.prototype)
        const rule = customMeta.getFieldMetadata('hash').getValidators()?.find(v => v.type === 'isHash')

        const error = rule?.validate('invalid')
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.message).toBe('custom error')
    })
})