import { cargoErrorMessage, TypedPropertyDecorator } from '../../types'
import { ValidatorRule } from '../../validatorRule'
import { addValidator } from './addValidator'

/**
 * Checks if the Date value is greater than or equal to the given minimum date.
 * @param min - The minimum allowed date, or a function that returns it.
 * @param message - Optional custom error message.
 */
export function MinDate(min: Date | (() => Date), message?: cargoErrorMessage): TypedPropertyDecorator<Date> {
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
                    return value instanceof Date && !isNaN(value.getTime()) && value >= minDate
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
export function MaxDate(max: Date | (() => Date), message?: cargoErrorMessage): TypedPropertyDecorator<Date> {
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
                    return value instanceof Date && !isNaN(value.getTime()) && value <= maxDate
                },
                message || (() => `${String(propertyKey)} must be before ${maxDate}`),
            ),
        )
    }
}
