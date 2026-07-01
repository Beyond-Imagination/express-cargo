import { bindingCargo, Body, File, Files, Optional, getCargo, CargoValidationError, setCargoFileLocator, getCargoFileLocator, FileLocator } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'

/** Builds a multer-like file object. */
function mockFile(fieldname: string, originalname: string, extra: Record<string, unknown> = {}) {
    return { fieldname, originalname, mimetype: 'image/png', size: 1024, buffer: Buffer.from('data'), ...extra }
}

describe('file source binding', () => {
    const defaultLocator = getCargoFileLocator()

    afterEach(() => {
        // Restore the default locator so custom-locator tests don't leak.
        setCargoFileLocator(defaultLocator)
    })

    it('binds a single uploaded file from req.file (upload.single)', () => {
        class UploadDTO {
            @Body('title') title!: string
            @File() avatar!: unknown
        }

        const file = mockFile('avatar', 'me.png')
        const req = makeMockReq({ body: { title: 'hi' }, file } as object)
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(UploadDTO)(req, res, next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<UploadDTO>(req)
        expect(dto.title).toBe('hi')
        // Same reference → the file object is passed through untouched.
        expect(dto.avatar).toBe(file)
    })

    it('binds every file with @Files (upload.array)', () => {
        class GalleryDTO {
            @Files('photos') photos!: unknown[]
        }

        const f1 = mockFile('photos', '1.png')
        const f2 = mockFile('photos', '2.png')
        const req = makeMockReq({ files: [f1, f2] } as object)
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(GalleryDTO)(req, res, next)

        const dto = getCargo<GalleryDTO>(req)
        expect(dto.photos).toEqual([f1, f2])
    })

    it('binds files from the fielded object form (upload.fields)', () => {
        class ProfileDTO {
            @File() avatar!: unknown
            @Files('gallery') gallery!: unknown[]
        }

        const avatar = mockFile('avatar', 'a.png')
        const g1 = mockFile('gallery', 'g1.png')
        const req = makeMockReq({ files: { avatar: [avatar], gallery: [g1] } } as object)
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(ProfileDTO)(req, res, next)

        const dto = getCargo<ProfileDTO>(req)
        expect(dto.avatar).toBe(avatar)
        expect(dto.gallery).toEqual([g1])
    })

    it('preserves the parser-produced shape (no transformation, e.g. diskStorage path)', () => {
        class FileDTO {
            @File() file!: unknown
        }

        const diskFile = mockFile('file', 'x.png', { path: '/tmp/x.png', buffer: undefined })
        const req = makeMockReq({ file: diskFile } as object)
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(FileDTO)(req, res, next)

        const dto = getCargo<FileDTO>(req) as { file: Record<string, unknown> }
        expect(dto.file).toBe(diskFile)
        expect(dto.file.path).toBe('/tmp/x.png')
    })

    it('sets an optional file to null when it is missing', () => {
        class OptUploadDTO {
            @File() @Optional() avatar?: unknown
        }

        const req = makeMockReq({})
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(OptUploadDTO)(req, res, next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<OptUploadDTO>(req)
        expect(dto.avatar).toBeNull()
    })

    it('raises a required error when a mandatory file is missing', () => {
        class RequiredUploadDTO {
            @File() avatar!: unknown
        }

        const req = makeMockReq({})
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(RequiredUploadDTO)(req, res, next)

        const err = next.mock.calls[0][0]
        expect(err).toBeInstanceOf(CargoValidationError)
        expect(err.errors.map((e: CargoValidationError['errors'][number]) => e.message)).toContain('avatar is required')
    })

    it('binds multiple fields with distinct names (mixed @File/@Files, array form)', () => {
        class MultiDTO {
            @Files('a1') a1!: unknown[]
            @File('a2') a2!: unknown
        }

        const f1 = mockFile('a1', '1.png')
        const f2 = mockFile('a1', '2.png')
        const f3 = mockFile('a2', '3.png')
        // upload.any(): req.files is a flat array mixing field names
        const req = makeMockReq({ files: [f1, f2, f3] } as object)
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(MultiDTO)(req, res, next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<MultiDTO>(req)
        expect(dto.a1).toEqual([f1, f2])
        expect(dto.a2).toBe(f3)
    })

    it('supports a custom locator for non-multer parsers', () => {
        class CustomDTO {
            @File() avatar!: unknown
        }

        // express-fileupload shape: req.files = { avatar: <file> } (not an array)
        const efuFile = { name: 'x.png', mimetype: 'image/png', size: 1 }
        const efuLocator: FileLocator = req => {
            const out: Record<string, unknown[]> = {}
            const files = (req as unknown as { files?: Record<string, unknown> }).files
            if (files) {
                for (const name of Object.keys(files)) out[name] = [files[name]]
            }
            return out
        }
        setCargoFileLocator(efuLocator)

        const req = makeMockReq({ files: { avatar: efuFile } } as object)
        const res = makeMockRes()
        const next = makeNext()

        bindingCargo(CustomDTO)(req, res, next)

        const dto = getCargo<CustomDTO>(req)
        expect(dto.avatar).toBe(efuFile)
    })
})
