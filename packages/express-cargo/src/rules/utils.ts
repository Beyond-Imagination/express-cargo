const PRIMITIVE_TYPES: readonly unknown[] = [String, Number, Boolean]

export function isPrimitiveType(fieldType: unknown): boolean {
    return PRIMITIVE_TYPES.includes(fieldType)
}

export function isKnownNonArray(fieldType: unknown): boolean {
    return typeof fieldType === 'function' && fieldType !== Array && fieldType !== Object
}
