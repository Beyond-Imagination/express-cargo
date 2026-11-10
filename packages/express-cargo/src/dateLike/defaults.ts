import { describeKind, dateKindOfType } from './kind'
import { adapterForType } from './registry'
import { INVALID_CAST } from './types'

/** A `@Default` after casting: the value to use, or why it cannot be used. */
export type DefaultCast = { value: unknown } | { error: string }

/**
 * Casts a `@Default` like a request value when the field (or, for a list, its element) is date-like, so
 * `@Default('P7D')` on a Duration gives a Duration whether or not the client sent the field. Lists get a new array,
 * so a handler that changes it does not change the next request's default. Other defaults are returned as they are.
 * The schema rule reports errors at startup; binding throws them as a fallback.
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
