import type { Source } from '../types'

/** Returned by {@link DateLikeAdapter.cast} when the raw value cannot become the target type. */
export const INVALID_CAST: unique symbol = Symbol('express-cargo.invalidCast')

/** Binding and comparison rules for one family of date-like types: the built-in `Date`, or `Temporal`. */
export interface DateLikeAdapter {
    /** The constructors this adapter binds, such as `Date`. */
    readonly types: readonly unknown[]

    /** True when the value is an instance this adapter can compare. */
    ownsValue(value: unknown): boolean

    /** Converts a raw request value from `source` into an instance of `type`, or returns {@link INVALID_CAST}. */
    cast(type: unknown, value: unknown, source: Source): unknown

    /** The cast error message for `type`, without the field name, such as `must be a valid date`. */
    invalidMessage(type: unknown): string

    /** Orders a value this adapter owns against a bound: negative, zero, positive, or undefined when it cannot. */
    compare(a: unknown, b: unknown): number | undefined

    /** True when two values this adapter owns represent the same value. */
    equals(a: unknown, b: unknown): boolean
}
