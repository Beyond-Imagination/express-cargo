import { describeKind, dateKindOfType } from './kind'
import { adapterForType } from './registry'
import { INVALID_CAST } from './types'

/** A `@Default` after casting: the value to use, or why it cannot be used. */
export type DefaultCast = { value: unknown } | { error: string }

/**
 * Casts a `@Default` like a request value when the field or list element is date-like, e.g. `'P7D'` to a Duration.
 * Lists get a new array per request. Other defaults are returned as they are.
 */
export function castDateDefault(type: unknown, elementType: unknown, value: unknown): DefaultCast {
    if (!Array.isArray(value)) return castOne(type, value)
    if (!adapterForType(elementType)) return { value }
    const items: unknown[] = []
    for (const item of value) {
        const result = castOne(elementType, item)
        if ('error' in result) return result
        items.push(result.value)
    }
    return { value: items }
}

function castOne(type: unknown, value: unknown): DefaultCast {
    // null keeps meaning "null when missing"; booleans were never dates and stay as they are.
    const adapter = adapterForType(type)
    if (!adapter || value === null || typeof value === 'boolean') return { value }
    const cast = adapter.cast(type, value, 'body')
    if (cast !== INVALID_CAST) return { value: cast }
    const shown = typeof value === 'string' ? `"${value}"` : describeKind(value)
    return { error: `@Default value ${shown} is not a valid ${dateKindOfType(type)}` }
}
