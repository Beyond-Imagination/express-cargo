import { CargoFieldError, IsJwt } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('isJwt decorator', () => {
    class Sample {
        @IsJwt()
        token!: string

        noValidatorValue!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)
    const meta = classMeta.getFieldMetadata('token')
    const isJwtRule = meta.getValidators()?.find(v => v.type === 'isJwt')

    it('should have isJwt validator', () => {
        expect(isJwtRule).toBeDefined()
        expect(isJwtRule?.message).toBe('token should be a valid JWT')
    })

    it('should pass for valid JWT strings', () => {
        const validJwt =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        expect(isJwtRule?.validate(validJwt)).toBeNull()
    })

    it('should pass for JWT with empty signature', () => {
        const unsignedJwt = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjM0NTY3ODkwIn0.'
        expect(isJwtRule?.validate(unsignedJwt)).toBeNull()
    })

    it('should fail for strings missing parts', () => {
        expect(isJwtRule?.validate('onlyone')).toBeInstanceOf(CargoFieldError)
        expect(isJwtRule?.validate('only.two')).toBeInstanceOf(CargoFieldError)
        expect(isJwtRule?.validate('too.many.dots.here')).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for strings with invalid characters', () => {
        expect(isJwtRule?.validate('hea!der.payload.signature')).toBeInstanceOf(CargoFieldError)
        expect(isJwtRule?.validate('header.pay load.signature')).toBeInstanceOf(CargoFieldError)
    })

    it('should fail for non-string values', () => {
        expect(isJwtRule?.validate(null)).toBeInstanceOf(CargoFieldError)
        expect(isJwtRule?.validate(undefined)).toBeInstanceOf(CargoFieldError)
        expect(isJwtRule?.validate(123)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have isJwt validator on undecorated field', () => {
        const meta = classMeta.getFieldMetadata('noValidatorValue')
        const rule = meta.getValidators()?.find(v => v.type === 'isJwt')
        expect(rule).toBeUndefined()
    })

    it('should support custom error message', () => {
        class CustomMessage {
            @IsJwt('custom error')
            value!: string
        }

        const customMeta = new CargoClassMetadata(CustomMessage.prototype)
        const meta = customMeta.getFieldMetadata('value')
        const rule = meta.getValidators()?.find(v => v.type === 'isJwt')

        const error = rule?.validate('not-a-jwt')
        expect(error).toBeInstanceOf(CargoFieldError)
        expect(error?.message).toBe('custom error')
    })
})
