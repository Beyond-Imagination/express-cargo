import { dateAdapter } from './dateAdapter'
import { DateLikeAdapter } from './types'

const adapters: DateLikeAdapter[] = [dateAdapter]
const adapterByType = new Map<unknown, DateLikeAdapter>(adapters.flatMap(adapter => adapter.types.map(type => [type, adapter] as const)))

/** The adapter that binds the given constructor, or undefined when it is not a date-like type. */
export function adapterForType(type: unknown): DateLikeAdapter | undefined {
    return adapterByType.get(type)
}

/** The adapter that owns the given value, or undefined when it is not a date-like value. */
export function adapterForValue(value: unknown): DateLikeAdapter | undefined {
    if (typeof value !== 'object' || value === null) return undefined
    for (const adapter of adapters) {
        if (adapter.ownsValue(value)) return adapter
    }
    return undefined
}

/**
 * Orders a date-like value against a bound, through the adapter that owns the value.
 * Returns undefined when the value is not date-like or the adapter cannot order the pair.
 */
export function compareDateLike(value: unknown, bound: unknown): number | undefined {
    const adapter = adapterForValue(value)
    return adapter ? adapter.compare(value, bound) : undefined
}
