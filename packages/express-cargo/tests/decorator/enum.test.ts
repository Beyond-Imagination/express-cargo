import { CargoFieldError } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'
import { Enum } from '../../src/enum'

enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

enum NumericRole {
    ADMIN,
    USER,
}

describe('enum', () => {
    class Sample {
        @Enum(Role)
        role!: Role

        @Enum(NumericRole)
        numericRole!: NumericRole

        noValidator!: Role
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have enum metadata', () => {
        const meta = classMeta.getFieldMetadata('role')
        const enumRule = meta.getValidators()?.find(v => v.type === 'enum')

        expect(enumRule).toBeDefined()
        expect(enumRule?.message).toBe('role must be one of: admin, user')
        expect(enumRule?.validate('super-admin')).toBeInstanceOf(CargoFieldError)
        expect(enumRule?.validate('admin')).toBeNull()
    })

    it('should handle numeric enums', () => {
        const meta = classMeta.getFieldMetadata('numericRole')
        const enumRule = meta.getValidators()?.find(v => v.type === 'enum')

        expect(enumRule).toBeDefined()
        expect(enumRule?.message).toBe('numericRole must be one of: 0, 1')
        expect(enumRule?.validate('super-admin')).toBeInstanceOf(CargoFieldError)
        expect(enumRule?.validate('0')).toBeNull()
        expect(enumRule?.validate(0)).toBeNull()
        expect(enumRule?.validate(0)).toBeNull()
        expect(enumRule?.validate('ADMIN')).toBeNull()
    })

    it('should not have enum metadata', () => {
        const meta = classMeta.getFieldMetadata('noValidator')
        const enumRule = meta.getValidators()?.find(v => v.type === 'enum')

        expect(enumRule).toBeUndefined()
    })
})
