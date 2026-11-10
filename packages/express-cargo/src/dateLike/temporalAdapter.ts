import { temporalTypeName, temporalValueName } from './temporalSupport'
import { DateLikeAdapter, INVALID_CAST } from './types'

/** The Temporal types express-cargo binds, by their name under the `Temporal` namespace. */
const TEMPORAL_TYPE_NAMES = [
    'Instant',
    'ZonedDateTime',
    'PlainDateTime',
    'PlainDate',
    'PlainTime',
    'PlainYearMonth',
    'PlainMonthDay',
    'Duration',
] as const

export type TemporalTypeName = (typeof TEMPORAL_TYPE_NAMES)[number]

/** The parts of a Temporal type this adapter uses. */
interface TemporalType {
    from(item: unknown, options?: { overflow: 'reject' }): object
    compare?(a: unknown, b: unknown): number
    prototype: object
}

/** Types with no object form in Temporal, so only their string form binds. */
const STRING_ONLY_TYPES: ReadonlySet<string> = new Set(['Instant'])

/** Types that Temporal cannot order without extra context, so they only support equality. */
const UNORDERED_TYPES: ReadonlySet<string> = new Set(['PlainMonthDay', 'Duration'])

function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

/**
 * True when a value uses the ISO 8601 calendar, or has no calendar (Instant, PlainTime, Duration).
 * A client could otherwise pick another calendar (`[u-ca=hebrew]`, `{ calendar: 'hebrew' }`) and change
 * what the year, month and day mean.
 */
function isIsoCalendar(value: object): boolean {
    const calendarId = (value as { calendarId?: string }).calendarId
    return calendarId === undefined || calendarId === 'iso8601'
}

/**
 * Binds the built-in Temporal types. Only created on a runtime where {@link isTemporalSupported} is true.
 *
 * - A string is parsed with `Temporal.X.from()` from any source, so Plain types accept and drop a UTC offset
 *   as Temporal does, while a `Z` suffix or a missing time zone is rejected.
 * - A plain object is parsed only from the request body, with `overflow: 'reject'` so `{ month: 2, day: 30 }` fails.
 * - An instance of the same type is kept as it is. Numbers, arrays and other Temporal types are rejected.
 * - Only the ISO 8601 calendar binds; a value in any other calendar is rejected.
 */
export function createTemporalAdapter(temporal: Record<string, unknown>): DateLikeAdapter {
    const typeByName = new Map<string, TemporalType>()
    for (const name of TEMPORAL_TYPE_NAMES) {
        const type = temporal[name] as TemporalType | undefined
        if (typeof type === 'function') typeByName.set(name, type)
    }
    const types = [...typeByName.values()]
    const nameOf = (type: unknown): string => temporalTypeName(type) ?? 'Temporal value'

    return {
        types,

        ownsValue(value) {
            const name = temporalValueName(value)
            return name !== undefined && typeByName.has(name)
        },

        cast(type, value, source) {
            const name = temporalTypeName(type)
            const temporalType = name === undefined ? undefined : typeByName.get(name)
            if (!temporalType) return INVALID_CAST

            if (value instanceof (temporalType as unknown as new () => object)) return isIsoCalendar(value) ? value : INVALID_CAST

            let parsed: object | undefined
            try {
                if (typeof value === 'string') {
                    parsed = temporalType.from(value)
                } else if (source === 'body' && isPlainObject(value) && !STRING_ONLY_TYPES.has(name!)) {
                    parsed = name === 'Duration' ? temporalType.from(value) : temporalType.from(value, { overflow: 'reject' })
                }
            } catch {
                // RangeError or TypeError from Temporal: reported as one cast error below.
            }
            return parsed !== undefined && isIsoCalendar(parsed) ? parsed : INVALID_CAST
        },

        invalidMessage(type) {
            return `must be a valid ${nameOf(type)}`
        },

        compare(a, b) {
            const name = temporalValueName(a)
            if (name === undefined || name !== temporalValueName(b) || UNORDERED_TYPES.has(name)) return undefined
            const compare = typeByName.get(name)?.compare
            return compare ? compare(a, b) : undefined
        },

        equals(a, b) {
            const name = temporalValueName(a)
            if (name === undefined || name !== temporalValueName(b)) return false
            // Duration has no equals(); PT60M and PT1H are distinct values, as their strings are.
            if (name === 'Duration') return String(a) === String(b)
            return (a as { equals(other: unknown): boolean }).equals(b)
        },
    }
}

/** `@List` type names for Temporal element types, such as `@List('plainDate')`. */
const TEMPORAL_LIST_ALIASES: Readonly<Record<string, TemporalTypeName>> = {
    instant: 'Instant',
    zonedDateTime: 'ZonedDateTime',
    plainDateTime: 'PlainDateTime',
    plainDate: 'PlainDate',
    plainTime: 'PlainTime',
    plainYearMonth: 'PlainYearMonth',
    plainMonthDay: 'PlainMonthDay',
    duration: 'Duration',
}

/** The Temporal type name a `@List` type name stands for, such as `'plainDate'` → `'PlainDate'`. */
export function temporalAliasName(alias: string): TemporalTypeName | undefined {
    return Object.prototype.hasOwnProperty.call(TEMPORAL_LIST_ALIASES, alias) ? TEMPORAL_LIST_ALIASES[alias] : undefined
}
