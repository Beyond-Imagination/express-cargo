import { dateAdapter } from './dateAdapter'
import { createTemporalAdapter } from './temporalAdapter'
import { isTemporalSupported } from './temporalSupport'
import { DateLikeAdapter } from './types'

let adapters: DateLikeAdapter[] | undefined
let adapterByType: Map<unknown, DateLikeAdapter> | undefined

/** Builds the adapter list on first use rather than at import. */
function registry(): Map<unknown, DateLikeAdapter> {
    if (!adapterByType) {
        adapters = [dateAdapter]
        if (isTemporalSupported()) {
            adapters.push(createTemporalAdapter((globalThis as unknown as { Temporal: Record<string, unknown> }).Temporal))
        }
        adapterByType = new Map(adapters.flatMap(adapter => adapter.types.map(type => [type, adapter] as const)))
    }
    return adapterByType
}

/** The adapter that binds the given constructor, or undefined when it is not a date-like type. */
export function adapterForType(type: unknown): DateLikeAdapter | undefined {
    return (adapterByType ?? registry()).get(type)
}

/** The adapter that owns the given value, or undefined when it is not a date-like value. */
export function adapterForValue(value: unknown): DateLikeAdapter | undefined {
    if (typeof value !== 'object' || value === null) return undefined
    if (!adapters) registry()
    for (const adapter of adapters!) {
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
