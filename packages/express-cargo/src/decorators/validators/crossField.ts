import { cargoErrorMessage } from '../../types'
import { ValidatorRule } from '../../validatorRule'
import { addValidator } from './addValidator'

/**
 * Validates that if the decorated property has a value, the specified field must also be present.
 * @param fieldName - The name of the required field.
 * @param message - Optional custom error message.
 */
export function With(fieldName: string, message?: cargoErrorMessage): PropertyDecorator {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'with',
                (value: unknown, instance?: Record<string | symbol, any>) => !(!!value && !instance?.[fieldName]),
                message || `${String(propertyKey)} requires ${fieldName}`,
            ),
            { name: With.name, category: 'validator', args: [fieldName] },
        )
    }
}

/**
 * Validates that if the decorated property has a value, the specified field must NOT be present.
 * @param fieldName - The name of the field that must be absent.
 * @param message - Optional custom error message.
 */
export function Without(fieldName: string, message?: cargoErrorMessage): PropertyDecorator {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'without',
                (value: unknown, instance?: Record<string | symbol, any>) =>
                    !(!!value && !!instance?.[fieldName]),
                message || `${String(propertyKey)} cannot exist with ${fieldName}`,
            ),
            { name: Without.name, category: 'validator', args: [fieldName] },
        )
    }
}
