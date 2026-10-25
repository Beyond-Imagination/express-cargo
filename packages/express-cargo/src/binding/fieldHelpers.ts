import { CargoFieldError } from '../errors'
import { CargoFieldMetadata } from '../metadata'

// Marks errors raised because a value could not be cast to the field's type. The property is a non-enumerable
// symbol, so the error stays a plain CargoFieldError for users; a WeakSet lookup measured slower on this path.
const CAST_ERROR = Symbol('cargo:castError')

function isCastError(error: CargoFieldError): boolean {
    return (error as any)[CAST_ERROR] === true
}

/** Creates a type-cast error; {@link validateCastField} keeps validators from repeating it. */
export function castError(errorKey: string, message: string): CargoFieldError {
    const error = new CargoFieldError(errorKey, message)
    Object.defineProperty(error, CAST_ERROR, { value: true })
    return error
}

/** True when an error added from `start` onwards is a type-cast error. */
export function hasCastError(errors: CargoFieldError[], start: number): boolean {
    for (let i = start; i < errors.length; i++) {
        if (isCastError(errors[i])) return true
    }
    return false
}

export function getErrorKey(sourceKey: string, currentKey: string): string {
    return sourceKey ? `${sourceKey}.${currentKey}` : currentKey
}

export function getFieldKey(meta: CargoFieldMetadata, sourceKey: string, errors: CargoFieldError[]): string | undefined {
    const metaKey = meta.getKey()
    const key = typeof metaKey === 'string' ? metaKey : metaKey.description

    if (!key) {
        errors.push(new CargoFieldError(getErrorKey(sourceKey, String(metaKey)), 'empty string or symbol is not allowed'))
        return undefined
    }

    return key
}

/**
 * Runs the field's validators. Failures are reported under the same path (parent path + source key)
 * that missing-value and type-cast errors use; the parent path is only joined once a rule fails.
 */
export function validateField(
    meta: CargoFieldMetadata,
    property: string | symbol,
    key: string,
    sourceKey: string,
    targetObject: any,
    errors: CargoFieldError[],
): void {
    for (const rule of meta.getValidators()) {
        const error = rule.validate(targetObject[property], targetObject, key)
        if (error) {
            if (sourceKey) error.field = getErrorKey(sourceKey, String(error.field))
            errors.push(error)
        }
    }
}

/**
 * Runs the field's validators once casting has added errors (from `castStart` on), unless casting already
 * reported the field's own path: a value that failed to cast is `undefined`, so its validator errors only repeat it.
 */
export function validateCastField(
    meta: CargoFieldMetadata,
    property: string | symbol,
    key: string,
    sourceKey: string,
    targetObject: any,
    errors: CargoFieldError[],
    castStart: number,
): void {
    let castPaths: (string | symbol)[] | undefined
    for (let i = castStart; i < errors.length; i++) {
        if (isCastError(errors[i])) (castPaths ??= []).push(errors[i].field)
    }
    if (!castPaths) return validateField(meta, property, key, sourceKey, targetObject, errors)
    if (castPaths.includes(getErrorKey(sourceKey, key))) return

    // The field's own value cast; drop validator errors (e.g. from @Each) on elements that failed to cast.
    const validatorStart = errors.length
    validateField(meta, property, key, sourceKey, targetObject, errors)
    let kept = validatorStart
    for (let i = validatorStart; i < errors.length; i++) {
        if (!castPaths.includes(errors[i].field)) errors[kept++] = errors[i]
    }
    errors.length = kept
}

export function handleMissing(
    meta: CargoFieldMetadata,
    property: string | symbol,
    key: string,
    value: any,
    targetObject: any,
    errors: CargoFieldError[],
    sourceKey: string,
): boolean {
    if (value !== undefined && value !== null) {
        return false
    }

    if (meta.getDefault() !== undefined) {
        targetObject[property] = meta.getDefault()
        return true
    }

    if (meta.getOptional()) {
        targetObject[property] = null
        return true
    }

    errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} is required`))
    return true
}
