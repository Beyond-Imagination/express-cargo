import { Body, List, Type } from '../../src'
import { isTemporalSupported } from '../../src/dateLike'
import { CargoClassMetadata } from '../../src/metadata'
import { fakeTemporalType } from '../dateLike/fakeTemporal'
import { expectViolation, validateCargoSchema } from './testUtils'

const PlainDate = fakeTemporalType('PlainDate')
type PlainDate = InstanceType<typeof PlainDate>
const MESSAGE = 'Temporal.PlainDate fields require Node.js 26 or later with built-in Temporal'

// On a supported runtime this rule never reports; binding Temporal fields is tested there instead.
;(isTemporalSupported() ? describe.skip : describe)('schema validation — Temporal on an unsupported runtime', () => {
    it('rejects a field whose property type is a Temporal type', () => {
        class PropertyTypeDto {
            @Body()
            due!: PlainDate
        }

        expectViolation(() => validateCargoSchema(PropertyTypeDto), 'due', MESSAGE)
    })

    it('rejects a Temporal type given to @Type', () => {
        class TypeDto {
            @Body()
            @Type(() => PlainDate)
            due!: object
        }

        expectViolation(() => validateCargoSchema(TypeDto), 'due', MESSAGE)
    })

    it('rejects a Temporal list element', () => {
        class ListDto {
            @Body()
            @List(PlainDate)
            dues!: PlainDate[]
        }

        expectViolation(() => validateCargoSchema(ListDto), 'dues', MESSAGE)
    })

    it('rejects a Temporal type name given to @List', () => {
        class ListNameDto {
            @Body()
            @List('plainDate')
            dues!: string[]
        }

        expectViolation(() => validateCargoSchema(ListNameDto), 'dues', MESSAGE)
    })

    const realTemporal = (globalThis as { Temporal?: { PlainDate: new () => object } }).Temporal
    ;(realTemporal ? it : it.skip)('rejects the Temporal of a runtime it does not support, such as Node.js 24 with a flag', () => {
        class FlaggedDto {
            @Body()
            @Type(() => realTemporal!.PlainDate)
            due!: object
        }

        expectViolation(() => validateCargoSchema(FlaggedDto), 'due', MESSAGE)
    })

    it('leaves a Temporal list element unset', () => {
        class ListNameDto {
            @Body()
            @List('plainDate')
            dues!: string[]
        }

        expect(new CargoClassMetadata(ListNameDto.prototype).getFieldMetadata('dues').getArrayElementType()).toBeUndefined()
    })

    it('accepts fields without Temporal types', () => {
        class PlainDto {
            @Body()
            due!: Date
        }

        expect(() => validateCargoSchema(PlainDto)).not.toThrow()
    })
})
