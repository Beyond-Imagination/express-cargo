import { CargoFieldError } from '../types'
import { CargoFieldMetadata } from '../metadata'

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

export function validateField(meta: CargoFieldMetadata, property: string | symbol, targetObject: any, errors: CargoFieldError[]): void {
    for (const rule of meta.getValidators()) {
        const error = rule.validate(targetObject[property], targetObject)
        if (error) {
            errors.push(error)
        }
    }
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
