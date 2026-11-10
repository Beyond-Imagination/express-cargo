import { CargoErrorMessage, TypedPropertyDecorator } from '../../types'
import { ValidatorRule } from '../../validatorRule'
import { addValidator } from './addValidator'
import { compareDateLike } from '../../dateLike'

/**
 * Checks if the Date value is greater than or equal to the given minimum date.
 * @param min - The minimum allowed date, or a function that returns it.
 * @param message - Optional custom error message.
 */
export function MinDate(min: Date | (() => Date), message?: CargoErrorMessage): TypedPropertyDecorator<Date> {
    return (target, propertyKey): void => {
        let minDate: Date
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'minDate',
                (value: unknown) => {
                    minDate = typeof min === 'function' ? min() : min
                    const order = compareDateLike(value, minDate)
                    return order !== undefined && order >= 0
                },
                message || (() => `${String(propertyKey)} must be after ${minDate}`),
            ),
        )
    }
}

/**
 * Checks if the Date value is less than or equal to the given maximum date.
 * @param max - The maximum allowed date, or a function that returns it.
 * @param message - Optional custom error message.
 */
export function MaxDate(max: Date | (() => Date), message?: CargoErrorMessage): TypedPropertyDecorator<Date> {
    return (target, propertyKey): void => {
        let maxDate: Date
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'maxDate',
                (value: unknown) => {
                    maxDate = typeof max === 'function' ? max() : max
                    const order = compareDateLike(value, maxDate)
                    return order !== undefined && order <= 0
                },
                message || (() => `${String(propertyKey)} must be before ${maxDate}`),
            ),
        )
    }
}
