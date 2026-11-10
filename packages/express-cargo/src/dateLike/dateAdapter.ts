import { DateLikeAdapter, INVALID_CAST } from './types'

function isValidDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime())
}

/** The built-in `Date`. Behaves exactly as express-cargo always has. */
export const dateAdapter: DateLikeAdapter = {
    types: [Date],

    ownsValue(value) {
        return value instanceof Date
    },

    cast(_type, value) {
        const parsedDate = new Date(value as string | number | Date)
        return isNaN(parsedDate.getTime()) ? INVALID_CAST : parsedDate
    },

    invalidMessage() {
        return 'must be a valid date'
    },

    // Number(b) matches the `value >= min` coercion MinDate and MaxDate always used,
    // so a timestamp passed from plain JavaScript keeps working.
    compare(a, b) {
        if (!isValidDate(a)) return undefined
        const diff = a.getTime() - Number(b)
        return isNaN(diff) ? undefined : Math.sign(diff)
    },

    equals(a, b) {
        return (a as Date).getTime() === (b as Date).getTime()
    },
}
