import { CargoFieldError, max, optional } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'
import { enumType } from '../../src/enum'

enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

describe('enum', () => {
    class Sample {
        @enumType(Role)
        role!: Role

        noValidator!: Role
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)

    it('should have enum metadata', () => {
        const meta = classMeta.getFieldMetadata('role')
        const enumRule = meta.getValidators()?.find(v => v.type === 'enumType')

        expect(enumRule).toBeDefined()
        expect(enumRule?.message).toBe('role must be one of: admin, user')
        expect(enumRule?.validate('super-admin')).toBeInstanceOf(CargoFieldError)
        expect(enumRule?.validate('admin')).toBeNull()
    })

    it('should not have enum metadata', () => {
        const meta = classMeta.getFieldMetadata('noValidator')
        const maxRule = meta.getValidators()?.find(v => v.type === 'enumType')

        expect(maxRule).toBeUndefined()
    })
})
