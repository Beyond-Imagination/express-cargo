import { cargoErrorMessage, TypedPropertyDecorator } from '../../types'
import { ValidatorRule } from '../../validatorRule'
import { addValidator } from './addValidator'

/**
 * Checks if the value is strictly equal to the specified value.
 * @param value - The value to compare.
 * @param message - Optional custom error message.
 */
export function Equal(value: any, message?: cargoErrorMessage): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(propertyKey, 'equal', val => val === value, message || `${String(propertyKey)} must be equal to ${value}`),
        )
    }
}

/**
 * Checks if the value is not strictly equal to the specified value.
 * @param value - The value to compare.
 * @param message - Optional custom error message.
 */
export function NotEqual(value: any, message?: cargoErrorMessage): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(propertyKey, 'notEqual', val => val !== value, message || `${String(propertyKey)} must not be equal to ${value}`),
        )
    }
}

/**
 * Checks if the value is false.
 * @param message - Optional custom error message.
 */
export function IsFalse(message?: cargoErrorMessage): TypedPropertyDecorator<boolean> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(propertyKey, 'isFalse', val => val === false, message || `${String(propertyKey)} must be false`),
        )
    }
}

/**
 * Checks if the value is true.
 * @param message - Optional custom error message.
 */
export function IsTrue(message?: cargoErrorMessage): TypedPropertyDecorator<boolean> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(propertyKey, 'isTrue', val => val === true, message || `${String(propertyKey)} must be true`),
        )
    }
}

/**
 * Checks if the value is one of the allowed values.
 * @param options - Array of allowed values.
 * @param message - Optional custom error message.
 */
export function OneOf<T extends readonly any[]>(options: T, message?: cargoErrorMessage): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'oneOf',
                (value: unknown): value is T[number] => options.includes(value as T[number]),
                message || `${String(propertyKey)} must be one of ${options.join(', ')}`,
            ),
        )
    }
}

/**
 * Validates the value using a custom validation function.
 * @param validateFn - A function that returns true if valid, false otherwise.
 * @param message - Optional custom error message.
 */
export function Validate(validateFn: (value: unknown) => boolean, message?: cargoErrorMessage): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(propertyKey, 'validate', validateFn, message || `${String(propertyKey)} did not pass the provided validation rule.`),
        )
    }
}
