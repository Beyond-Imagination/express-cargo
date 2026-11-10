import { temporalValueName } from './temporalSupport'
import { DateLikeAdapter, INVALID_CAST } from './types'

function isValidDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime())
}

/** The built-in `Date`, cast and compared as express-cargo always has. */
export const dateAdapter: DateLikeAdapter = {
    types: [Date],

    ownsValue(value) {
        return value instanceof Date
    },

    cast(_type, value) {
        // new Date() throws for values that cannot become a number, such as a Temporal value, a Symbol or a BigInt.
        let parsedDate: Date
        try {
            parsedDate = new Date(value as string | number | Date)
        } catch {
            return INVALID_CAST
        }
        return isNaN(parsedDate.getTime()) ? INVALID_CAST : parsedDate
    },

    invalidMessage() {
        return 'must be a valid date'
    },

    // Number(b) keeps the `value >= min` coercion MinDate and MaxDate always used, so a timestamp bound still works.
    // A Temporal bound is skipped first, since its valueOf() throws.
    compare(a, b) {
        if (!isValidDate(a) || temporalValueName(b) !== undefined) return undefined
        let diff: number
        try {
            diff = a.getTime() - Number(b)
        } catch {
            return undefined // A Symbol or an object without a prototype cannot become a number.
        }
        return isNaN(diff) ? undefined : Math.sign(diff)
    },

    equals(a, b) {
        return (a as Date).getTime() === (b as Date).getTime()
    },
}
