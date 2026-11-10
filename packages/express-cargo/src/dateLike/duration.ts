import { temporalValueName } from './temporalSupport'

interface DurationType {
    from(item: unknown): object
    compare(a: unknown, b: unknown): number
}

const CALENDAR_UNITS = ['years', 'months', 'weeks'] as const

function durationType(): DurationType | undefined {
    return (globalThis as { Temporal?: { Duration?: DurationType } }).Temporal?.Duration
}

/** True for a `Temporal.Duration` value. */
export function isDurationValue(value: unknown): value is object {
    return temporalValueName(value) === 'Duration'
}

/** True when a duration has years, months or weeks, whose length depends on the start date. */
export function hasCalendarUnits(duration: object): boolean {
    return CALENDAR_UNITS.some(unit => (duration as Record<string, number>)[unit] !== 0)
}

/** Reads a duration given as a `Temporal.Duration` or an ISO 8601 string such as `PT5M`, or undefined when it cannot. */
export function toDuration(value: unknown): object | undefined {
    try {
        return durationType()?.from(value)
    } catch {
        return undefined
    }
}

/**
 * Why a MinDuration/MaxDuration bound cannot be used, or null when it can. A bound in years, months or weeks has no
 * fixed length, so it is rejected; durations without them compare without a start date. The schema rule reports this
 * at startup and the validator throws it as a fallback.
 */
export function durationBoundError(name: string, bound: unknown): string | null {
    const duration = toDuration(bound)
    if (duration === undefined) return `@${name} bound ${String(bound)} is not a valid ISO 8601 duration, such as PT5M`
    if (hasCalendarUnits(duration)) {
        return `@${name} bound ${String(duration)} has years, months or weeks, whose length varies; use days or smaller units, such as P30D`
    }
    return null
}

/** Orders two durations without years, months or weeks. */
export function compareDurations(a: object, b: object): number {
    return durationType()!.compare(a, b)
}
