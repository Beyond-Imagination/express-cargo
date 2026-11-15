import { List, MaxDate, MaxDuration, MinDate, MinDuration, Equal, NotEqual, OneOf } from '../decorators'
import {
    adapterForType,
    castDateDefault,
    dateKindOf,
    dateKindOfType,
    describeKind,
    durationBoundError,
    isTemporalSupported,
    TEMPORAL_MIN_NODE_MAJOR,
} from '../dateLike'
import { AppliedDecorator } from '../types'
import { FieldRuleFn, FieldState } from './types'

// Schema rules for Temporal fields and the date validators. They run once, when `bindingCargo()` analyses a DTO,
// so a misconfigured field stops the application at startup instead of failing every request.

const DATE_BOUNDS: readonly string[] = [MinDate.name, MaxDate.name]
const DURATION_BOUNDS: readonly string[] = [MinDuration.name, MaxDuration.name]
const VALUE_CHECKS: readonly string[] = [Equal.name, NotEqual.name, OneOf.name]

/** Each validator with one of the names, paired with the type it checks: the field, or the list element for @Each. */
function validatorsOn(s: FieldState, names: readonly string[]): [AppliedDecorator, unknown][] {
    const self = s.appliedSelf.filter(d => names.includes(d.name)).map(d => [d, s.boundType] as [AppliedDecorator, unknown])
    const each = s.appliedEach.filter(d => names.includes(d.name)).map(d => [d, s.elementType] as [AppliedDecorator, unknown])
    return [...self, ...each]
}

function firstViolation(pairs: [AppliedDecorator, unknown][], check: (validator: AppliedDecorator, type: unknown) => string | null): string | null {
    for (const [validator, type] of pairs) {
        const message = check(validator, type)
        if (message !== null) return message
    }
    return null
}

/** The fixed values a validator compares against: a MinDate/MaxDate bound, an Equal/NotEqual value, or OneOf options. */
function comparedValues(validator: AppliedDecorator): unknown[] {
    const [arg] = validator.args ?? []
    const values = validator.name === OneOf.name ? ((arg as readonly unknown[] | undefined) ?? []) : [arg]
    // Functions are only known while binding; null and undefined are about missing values, as in @NotEqual(null).
    return values.filter(value => typeof value !== 'function' && value !== null && value !== undefined)
}

// ---- Runtimes without Temporal --------------------------------------------------------------------------------

const needsSupportedRuntime: FieldRuleFn = s => {
    if (isTemporalSupported()) return null
    const requirement = `Node.js ${TEMPORAL_MIN_NODE_MAJOR} or later with built-in Temporal`
    // `@List('plainDate')` keeps its type name only in the applied tag, since there is no Temporal to resolve it to.
    const listName = s.appliedSelf.find(d => d.name === List.name)?.args?.[0]
    for (const type of [s.fieldType, s.elementType, listName, s.boundType]) {
        const kind = dateKindOfType(type)
        if (kind?.startsWith('Temporal.')) return `${kind} fields require ${requirement}`
    }
    // `@Type(() => Temporal.PlainDate)` throws here, so it has no static target.
    // Limit: an alias such as `@Type(() => T.PlainDate)` is missed, since it throws like a model not loaded yet;
    // it passes startup and fails each request.
    if (typeof s.typeFn === 'function' && s.typeFn.length === 0 && /\bTemporal\b/.test(Function.prototype.toString.call(s.typeFn))) {
        return `@Type refers to Temporal, which requires ${requirement}`
    }
    const [duration] = validatorsOn(s, DURATION_BOUNDS)
    return duration ? `@${duration[0].name} requires ${requirement}` : null
}

/**
 * Reports a Temporal type other than the built-in one, such as a polyfill's PlainDate, on a supported runtime.
 * Only built-in types have an adapter, so such a field would keep the raw request string.
 */
const builtInTemporalOnly: FieldRuleFn = s => {
    if (!isTemporalSupported() || valueComesFromCode(s)) return null
    for (const type of [s.fieldType, s.elementType, s.boundType]) {
        const kind = dateKindOfType(type)
        if (typeof type === 'function' && kind?.startsWith('Temporal.') && !adapterForType(type)) {
            return `${kind} type is not the built-in one, such as a polyfill type; express-cargo binds only built-in Temporal types`
        }
    }
    return null
}

// ---- Fields the binder cannot type ----------------------------------------------------------------------------

/** True for a validator that only works on a bound Temporal value: a duration bound, or a Temporal value to compare with. */
function needsTemporalValue(validator: AppliedDecorator): boolean {
    if (DURATION_BOUNDS.includes(validator.name)) return true
    if (!DATE_BOUNDS.includes(validator.name) && !VALUE_CHECKS.includes(validator.name)) return false
    return comparedValues(validator).some(value => dateKindOf(value)?.startsWith('Temporal.'))
}

/** True when code, not a cast, sets the value: a transform, a virtual or request field, or the session. */
function valueComesFromCode(s: FieldState): boolean {
    return s.hasVirtual || s.hasRequest || s.source === 'session' || s.appliedSelf.some(d => d.category === 'transform')
}

/**
 * Reports a Temporal validator on a value the binder cannot type (`T | null` without @Type, @Each without @List),
 * which would fail every request. Date validators are left alone, as before.
 */
const untypedTemporalField: FieldRuleFn = s => {
    // Without Temporal, needsSupportedRuntime reports these fields already.
    if (!isTemporalSupported() || valueComesFromCode(s)) return null
    if (s.fieldType === Object && s.typeFn === undefined) {
        const validator = s.appliedSelf.find(needsTemporalValue)
        if (validator) return `@${validator.name} needs the field type; add @Type(() => Temporal.X) to a nullable or aliased field`
    }
    if (s.elementType === undefined) {
        const validator = s.appliedEach.find(needsTemporalValue)
        if (validator) return `@${validator.name} inside @Each needs the element type; add @List(Temporal.X) or @List('plainDate')`
    }
    return null
}

// ---- Validators that do not fit the field ---------------------------------------------------------------------

/** True for a Date-field bound that `Number()` turns into a time, as binding compares; a date string is not one. */
function isDateBound(value: unknown): boolean {
    if (typeof value === 'string') return false
    try {
        return Number.isFinite(Number(value))
    } catch {
        return false // A Temporal value, a Symbol or an object without a prototype cannot become a number.
    }
}

/**
 * Reports a fixed value that can never match the field: another kind on a Temporal field, or a MinDate/MaxDate bound
 * that is no time on a Date field.
 */
function valueDoesNotFit(validator: AppliedDecorator, type: unknown): string | null {
    const fieldKind = dateKindOfType(type)
    if (fieldKind === undefined) return null
    const isBound = DATE_BOUNDS.includes(validator.name)
    if (fieldKind === 'Date' && !isBound) return null

    for (const value of comparedValues(validator)) {
        const fits = fieldKind === 'Date' ? isDateBound(value) : describeKind(value) === fieldKind
        if (fits) continue
        const role = isBound ? 'bound' : 'value'
        const kind = describeKind(value)
        if (kind === 'Invalid Date') return `@${validator.name} ${role} is an Invalid Date`
        const hint = fieldKind === 'Date' ? '' : `; use ${fieldKind}.from(...) instead`
        return `@${validator.name} ${role} ${String(value)} is a ${kind}, but the field is a ${fieldKind}${hint}`
    }
    return null
}

function dateBoundDoesNotFit(validator: AppliedDecorator, type: unknown): string | null {
    const kind = dateKindOfType(type)
    if (kind === 'Temporal.Duration')
        return `@${validator.name} cannot be applied to Temporal.Duration; use @${validator.name.replace('Date', 'Duration')}`
    if (kind === 'Temporal.PlainMonthDay') return `@${validator.name} cannot be applied to Temporal.PlainMonthDay, which has no order`
    return valueDoesNotFit(validator, type)
}

function durationBoundDoesNotFit(validator: AppliedDecorator, type: unknown): string | null {
    // An untyped field (Object) or an @Each without @List has no known type; untypedTemporalField covers them.
    if (type === Object || type === undefined || dateKindOfType(type) === 'Temporal.Duration') return null
    return `@${validator.name} can only be applied to Temporal.Duration`
}

const validatorsFitField: FieldRuleFn = s =>
    firstViolation(validatorsOn(s, DATE_BOUNDS), dateBoundDoesNotFit) ??
    firstViolation(validatorsOn(s, DURATION_BOUNDS), durationBoundDoesNotFit) ??
    firstViolation(validatorsOn(s, VALUE_CHECKS), valueDoesNotFit)

// ---- Bounds and defaults Temporal or Date cannot read ---------------------------------------------------------

/** Reports a duration bound that cannot be used, such as `@MinDuration('5 minutes')` or `@MaxDuration('P1M')`. */
const durationBoundsReadable: FieldRuleFn = s => {
    if (!isTemporalSupported()) return null
    return firstViolation(validatorsOn(s, DURATION_BOUNDS), validator => durationBoundError(validator.name, validator.args?.[0]))
}

/** Reports a `@Default` that cannot become the field's date type, such as `@Default('P7X')` on a Duration. */
const defaultReadable: FieldRuleFn = s => {
    if (s.defaultValue === undefined) return null
    const result = castDateDefault(s.boundType, s.elementType, s.defaultValue)
    return 'error' in result ? result.error : null
}

export const TEMPORAL_SUPPORT_RULES: readonly FieldRuleFn[] = [
    needsSupportedRuntime,
    builtInTemporalOnly,
    untypedTemporalField,
    validatorsFitField,
    durationBoundsReadable,
    defaultReadable,
]
