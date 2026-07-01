import { Body, Enum, Transform, UploadedFile, UploadedFiles } from '../../src'
import { expectViolation, validateCargoSchema } from './testUtils'

enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

describe('schema validation — transformer-priority rules', () => {
    it('rejects @Enum combined with @Transform (K3)', () => {
        class EnumAndTransformDto {
            @Body()
            @Enum(Role)
            @Transform((v: string) => v.toUpperCase())
            foo!: Role
        }

        expectViolation(() => validateCargoSchema(EnumAndTransformDto), 'foo', '@Enum cannot be combined with @Transform')
    })

    it('accepts @Enum without @Transform', () => {
        class EnumOnlyDto {
            @Body()
            @Enum(Role)
            foo!: Role
        }

        expect(() => validateCargoSchema(EnumOnlyDto)).not.toThrow()
    })

    it('accepts @Transform without @Enum', () => {
        class TransformOnlyDto {
            @Body()
            @Transform((v: string) => v.trim())
            foo!: string
        }

        expect(() => validateCargoSchema(TransformOnlyDto)).not.toThrow()
    })

    it('rejects @UploadedFile combined with @Transform', () => {
        class FileAndTransformDto {
            @UploadedFile()
            @Transform((v: unknown) => v)
            avatar!: unknown
        }

        expectViolation(() => validateCargoSchema(FileAndTransformDto), 'avatar', '@Transform cannot be applied to an uploaded file field')
    })

    it('rejects @UploadedFiles combined with @Transform', () => {
        class FilesAndTransformDto {
            @UploadedFiles('photos')
            @Transform((v: unknown) => v)
            photos!: unknown[]
        }

        expectViolation(() => validateCargoSchema(FilesAndTransformDto), 'photos', '@Transform cannot be applied to an uploaded file field')
    })

    it('accepts an uploaded file field without @Transform', () => {
        class FileOnlyDto {
            @UploadedFile()
            avatar!: unknown
        }

        expect(() => validateCargoSchema(FileOnlyDto)).not.toThrow()
    })
})
