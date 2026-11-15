import { CargoErrorMessage, TemporalDurationLike, TemporalLike, TypedPropertyDecorator } from '../../types'
import { ValidatorRule } from '../../validatorRule'
import { addValidator } from './addValidator'
import {
    compareDateLike,
    compareDurations,
    dateKindOf,
    describeKind,
    durationBoundError,
    hasCalendarUnits,
    isDurationValue,
    toDuration,
} from '../../dateLike'

/**
 * Orders a value against a MinDate/MaxDate bound. A non-date value or bound fails validation; a date bound that can
 * never be compared with the value (Invalid Date, another Temporal type) throws a setup error.
 */
function checkDateBound(name: string, value: unknown, bound: unknown, passes: (order: number) => boolean): boolean {
    const order = compareDateLike(value, bound)
    if (order !== undefined) return passes(order)
    if (dateKindOf(bound) !== undefined && compareDateLike(value, value) !== undefined) {
        const kind = describeKind(bound)
        const shown = kind === String(bound) ? kind : `${String(bound)} (${kind})`
        throw new Error(`@${name} bound ${shown} cannot be compared with a ${describeKind(value)} value`)
    }
    return false
}

/**
 * Checks if the value is on or after the given minimum.
 * Takes a `Date`, or a Temporal value of the same type as the field, such as a `Temporal.PlainDate`.
 * A bound of another type than the field is a setup error.
 * Use {@link MinDuration} for `Temporal.Duration` fields.
 * @param min - The minimum allowed value, or a function that returns it.
 * @param message - Optional custom error message.
 */
export function MinDate(min: Date | (() => Date), message?: CargoErrorMessage): TypedPropertyDecorator<Date>
export function MinDate<T extends TemporalLike>(min: T | (() => T), message?: CargoErrorMessage): TypedPropertyDecorator<T>
export function MinDate(min: unknown, message?: CargoErrorMessage): TypedPropertyDecorator<any> {
    return (target, propertyKey): void => {
        let minDate: unknown
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'minDate',
                (value: unknown) => {
                    minDate = typeof min === 'function' ? min() : min
                    return checkDateBound(MinDate.name, value, minDate, order => order >= 0)
                },
                message || (() => `${String(propertyKey)} must be on or after ${minDate}`),
            ),
            { name: MinDate.name, category: 'validator', args: [min] },
        )
    }
}

/**
 * Checks if the value is on or before the given maximum.
 * Takes a `Date`, or a Temporal value of the same type as the field, such as a `Temporal.PlainDate`.
 * A bound of another type than the field is a setup error.
 * Use {@link MaxDuration} for `Temporal.Duration` fields.
 * @param max - The maximum allowed value, or a function that returns it.
 * @param message - Optional custom error message.
 */
export function MaxDate(max: Date | (() => Date), message?: CargoErrorMessage): TypedPropertyDecorator<Date>
export function MaxDate<T extends TemporalLike>(max: T | (() => T), message?: CargoErrorMessage): TypedPropertyDecorator<T>
export function MaxDate(max: unknown, message?: CargoErrorMessage): TypedPropertyDecorator<any> {
    return (target, propertyKey): void => {
        let maxDate: unknown
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'maxDate',
                (value: unknown) => {
                    maxDate = typeof max === 'function' ? max() : max
                    return checkDateBound(MaxDate.name, value, maxDate, order => order <= 0)
                },
                message || (() => `${String(propertyKey)} must be on or before ${maxDate}`),
            ),
            { name: MaxDate.name, category: 'validator', args: [max] },
        )
    }
}

type DurationBound = TemporalDurationLike | string

function durationRule(propertyKey: string | symbol, name: 'MinDuration' | 'MaxDuration', bound: DurationBound, message?: CargoErrorMessage) {
    const atLeast = name === 'MinDuration'
    // Parsed on first use: parsing at decoration time would read `Temporal` on runtimes without it.
    let parsedBound: object | undefined

    return new ValidatorRule(
        propertyKey,
        atLeast ? 'minDuration' : 'maxDuration',
        (value: unknown) => {
            // Years, months and weeks have no fixed length, so such a value cannot be compared with the bound.
            if (!isDurationValue(value) || hasCalendarUnits(value)) return false
            if (parsedBound === undefined) {
                // The schema rule reports a bad bound at startup; this guards a rule used without it.
                const error = durationBoundError(name, bound)
                if (error) throw new Error(error)
                parsedBound = toDuration(bound)!
            }
            const order = compareDurations(value, parsedBound)
            return atLeast ? order >= 0 : order <= 0
        },
        (key, value) => {
            // A value in years, months or weeks is about units, not the bound, so it always gets this message.
            if (isDurationValue(value) && hasCalendarUnits(value)) {
                return `${String(key)} must be given in days or smaller units, such as P7D, not in years, months or weeks`
            }
            if (typeof message === 'string') return message
            if (message) return message(key, value)
            return `${String(key)} must be ${atLeast ? 'at least' : 'at most'} ${String(toDuration(bound) ?? bound)}`
        },
    )
}

/** Rejects a message that is neither a string nor a function, such as an options object passed from plain JavaScript. */
function checkMessage(name: string, message: unknown): void {
    if (message != null && typeof message !== 'string' && typeof message !== 'function') {
        throw new TypeError(`@${name} takes (bound, message?); message must be a string or a function`)
    }
}

/**
 * Checks if a `Temporal.Duration` value is at least the given minimum.
 * The bound must not use years, months or weeks (use `P30D`, not `P1M`), since their length varies.
 * A value in years, months or weeks fails, asking the client for days or smaller units.
 * @param min - The minimum as a `Temporal.Duration` or an ISO 8601 duration string such as `PT5M`.
 * @param message - Optional custom error message, used when the value is below the minimum.
 */
export function MinDuration(min: DurationBound, message?: CargoErrorMessage): TypedPropertyDecorator<TemporalDurationLike> {
    checkMessage(MinDuration.name, message)
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, durationRule(propertyKey, 'MinDuration', min, message), {
            name: MinDuration.name,
            category: 'validator',
            args: [min],
        })
    }
}

/**
 * Checks if a `Temporal.Duration` value is at most the given maximum.
 * The bound must not use years, months or weeks (use `P30D`, not `P1M`), since their length varies.
 * A value in years, months or weeks fails, asking the client for days or smaller units.
 * @param max - The maximum as a `Temporal.Duration` or an ISO 8601 duration string such as `PT2H`.
 * @param message - Optional custom error message, used when the value is above the maximum.
 */
export function MaxDuration(max: DurationBound, message?: CargoErrorMessage): TypedPropertyDecorator<TemporalDurationLike> {
    checkMessage(MaxDuration.name, message)
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, durationRule(propertyKey, 'MaxDuration', max, message), {
            name: MaxDuration.name,
            category: 'validator',
            args: [max],
        })
    }
}
