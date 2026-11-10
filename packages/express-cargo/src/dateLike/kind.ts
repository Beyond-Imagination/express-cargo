import { temporalAliasName } from './temporalAdapter'
import { temporalTypeName, temporalValueName } from './temporalSupport'

/**
 * The date kind of a value, `'Date'` or `'Temporal.PlainDate'` and so on, or undefined when it is not a date.
 * Schema rules and validators compare kinds to tell whether a bound or option fits a field.
 */
export function dateKindOf(value: unknown): string | undefined {
    if (value instanceof Date) return 'Date'
    const name = temporalValueName(value)
    return name === undefined ? undefined : `Temporal.${name}`
}

/** The date kind a field type binds to: a constructor, or a `@List` type name such as `'date'` or `'plainDate'`. */
export function dateKindOfType(type: unknown): string | undefined {
    if (type === Date || type === 'date') return 'Date'
    const name = typeof type === 'string' ? temporalAliasName(type) : temporalTypeName(type)
    return name === undefined ? undefined : `Temporal.${name}`
}

/** How a value reads in a setup message: `Invalid Date`, its date kind, or its JavaScript type such as `string`. */
export function describeKind(value: unknown): string {
    if (value instanceof Date && isNaN(value.getTime())) return 'Invalid Date'
    return dateKindOf(value) ?? (value === null ? 'null' : typeof value)
}
