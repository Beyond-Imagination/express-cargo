import { Request } from 'express'

/** An uploaded file as produced by a multipart parser (e.g. multer's `Express.Multer.File`). Bound as-is. */
export type CargoFile = any

/**
 * Locates uploaded files on the request, keyed by form field name.
 * Only the location is parser-specific; the file objects are returned untouched.
 */
export type FileLocator = (req: Request) => Record<string, CargoFile[]>

/** Default locator for multer's `req.file` (single) and `req.files` (array or fielded object). */
const multerFileLocator: FileLocator = (req: Request) => {
    const map: Record<string, CargoFile[]> = {}
    const push = (name: string, file: CargoFile) => {
        ;(map[name] ??= []).push(file)
    }

    const single = (req as any).file
    if (single) push(single.fieldname, single)

    // upload.array()/any() → File[]; upload.fields() → { field: File[] }
    const files = (req as any).files
    if (Array.isArray(files)) {
        for (const file of files) push(file.fieldname, file)
    } else if (files) {
        for (const name of Object.keys(files)) {
            map[name] = files[name]
        }
    }

    return map
}

let globalFileLocator: FileLocator = multerFileLocator

/**
 * Overrides the global file locator used during binding.
 * Only needed for parsers whose request shape differs from multer's.
 * @param locator - Returns uploaded files keyed by field name.
 */
export function setCargoFileLocator(locator: FileLocator): void {
    globalFileLocator = locator
}

/**
 * Retrieves the currently configured global file locator.
 * @returns The current file locator (defaults to multer support).
 */
export function getCargoFileLocator(): FileLocator {
    return globalFileLocator
}
