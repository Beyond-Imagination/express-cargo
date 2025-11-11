import { body, CargoFieldError, uuid } from '../../src'
import { CargoClassMetadata } from '../../src/metadata'

describe('uuid decorator', () => {
    class Sample {
        @body()
        @uuid()
        uuidAll!: string

        @body()
        @uuid('v4')
        uuidV1!: string

        @body()
        id!: string
    }

    const classMeta = new CargoClassMetadata(Sample.prototype)
    const uuidV1Sample = '057fe53a-a164-1501-93dc-44d1efea97da'
    const uuidV4Sample = '2c3f5421-37d4-44b6-8695-8825d56f75b3'
    const urid = '01K9SDMHDBMGQBMDR889PGN5Q4'
    const unknownId = 'b332e536-d3b0-27d3-b279-1dcbace62b23'

    it('should have all version uuid metadata', () => {
        const meta = classMeta.getFieldMetadata('uuidAll')
        const uuidRule = meta.getValidators()?.find(v => v.type === 'uuid')

        expect(uuidRule).toBeDefined()
        expect(uuidRule?.message).toBe('uuidAll must be a valid UUID format (v1, v3, v4, or v5)')
        expect(uuidRule?.validate(uuidV1Sample)).toBeNull()
        expect(uuidRule?.validate(uuidV4Sample)).toBeNull()
        expect(uuidRule?.validate(urid)).toBeInstanceOf(CargoFieldError)
        expect(uuidRule?.validate(unknownId)).toBeInstanceOf(CargoFieldError)
        expect(uuidRule?.validate(2)).toBeInstanceOf(CargoFieldError)
    })

    it('should have v4 version uuid metadata', () => {
        const meta = classMeta.getFieldMetadata('uuidV1')
        const uuidRule = meta.getValidators()?.find(v => v.type === 'uuid')

        expect(uuidRule).toBeDefined()
        expect(uuidRule?.message).toBe('uuidV1 must be a valid UUID format (v4)')
        expect(uuidRule?.validate(uuidV4Sample)).toBeNull()
        expect(uuidRule?.validate(uuidV1Sample)).toBeInstanceOf(CargoFieldError)
        expect(uuidRule?.validate(urid)).toBeInstanceOf(CargoFieldError)
        expect(uuidRule?.validate(unknownId)).toBeInstanceOf(CargoFieldError)
        expect(uuidRule?.validate(2)).toBeInstanceOf(CargoFieldError)
    })

    it('should not have uuid metadata', () => {
        const meta = classMeta.getFieldMetadata('id')
        const uuidRule = meta.getValidators()?.find(v => v.type === 'uuid')

        expect(uuidRule).toBeUndefined()
    })
})
