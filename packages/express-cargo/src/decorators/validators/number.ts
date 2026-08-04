import { cargoErrorMessage, TypedPropertyDecorator } from '../../types'
import { ValidatorRule } from '../../validatorRule'
import { addValidator } from './addValidator'

/**
 * Checks if the value is greater than or equal to the allowed minimum.
 * @param minimum - The minimum allowed value.
 * @param message - Optional custom error message.
 */
export function Min(minimum: number, message?: cargoErrorMessage): TypedPropertyDecorator<number> {
    return (target, propertyKey) => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'min',
                input => typeof input === 'number' && input >= minimum,
                message || `${String(propertyKey)} must be >= ${minimum}`,
            ),
        )
    }
}

/**
 * Checks if the value is less than or equal to the allowed maximum.
 * @param maximum - The maximum allowed value.
 * @param message - Optional custom error message.
 */
export function Max(maximum: number, message?: cargoErrorMessage): TypedPropertyDecorator<number> {
    return (target, propertyKey) => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'max',
                input => typeof input === 'number' && input <= maximum,
                message || `${String(propertyKey)} must be <= ${maximum}`,
            ),
        )
    }
}

/**
 * Checks if the value is within the specified range (inclusive).
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @param message - Optional custom error message.
 */
export function Range(min: number, max: number, message?: cargoErrorMessage): TypedPropertyDecorator<number> {
    return (target, propertyKey) => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'range',
                value => typeof value === 'number' && value >= min && value <= max,
                message || `${String(propertyKey)} must be between ${min} and ${max}`,
            ),
        )
    }
}
