import { cargoErrorMessage, EachValidatorRule, TypedPropertyDecorator, UuidVersion, ValidatorRule } from './types'
import { CargoClassMetadata } from './metadata'

function addValidator(target: any, propertyKey: string | symbol, rule: ValidatorRule) {
    const classMeta = new CargoClassMetadata(target)
    const fieldMeta = classMeta.getFieldMetadata(propertyKey)
    fieldMeta.addValidator(rule)
    classMeta.setFieldMetadata(propertyKey, fieldMeta)
}

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
 * Checks if the string starts with the specified prefix.
 * @param prefixText - The prefix string.
 * @param message - Optional custom error message.
 */
export function Prefix(prefixText: string, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey) => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'prefix',
                val => typeof val === 'string' && val.startsWith(prefixText),
                message || `${String(propertyKey)} must start with ${prefixText}`,
            ),
        )
    }
}

/**
 * Checks if the string ends with the specified suffix.
 * @param suffixText - The suffix string.
 * @param message - Optional custom error message.
 */
export function Suffix(suffixText: string, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey) => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'suffix',
                val => typeof val === 'string' && val.endsWith(suffixText),
                message || `${String(propertyKey)} must end with ${suffixText}`,
            ),
        )
    }
}

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
 * Checks if the string length matches the specified value.
 * @param value - The exact length required.
 * @param message - Optional custom error message.
 */
export function Length(value: number, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'length',
                (val: any) => typeof val === 'string' && val.length === value,
                message || `${String(propertyKey)} must be ${value} characters`,
            ),
        )
    }
}

/**
 * Checks if the string length is less than or equal to the maximum.
 * @param max - The maximum length allowed.
 * @param message - Optional custom error message.
 */
export function MaxLength(max: number, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'maxLength',
                (val: any) => typeof val === 'string' && val.length <= max,
                message || `${String(propertyKey)} must not exceed ${max} characters`,
            ),
        )
    }
}

/**
 * Checks if the string length is greater than or equal to the minimum.
 * @param min - The minimum length allowed.
 * @param message - Optional custom error message.
 */
export function MinLength(min: number, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'minLength',
                (val: any) => typeof val === 'string' && val.length >= min,
                message || `${String(propertyKey)} must be at least ${min} characters`,
            ),
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

/**
 * Checks if the string matches the specified regular expression.
 * @param pattern - The regular expression to match against.
 * @param message - Optional custom error message.
 */
export function Regexp(pattern: RegExp, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'regexp',
                (value: unknown) => typeof value === 'string' && pattern.test(value),
                message || `${String(propertyKey)} does not match pattern ${pattern}`,
            ),
        )
    }
}

/**
 * Checks if the string is a valid email address.
 * @param message - Optional custom error message.
 */
export function Email(message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        const DEFAULT_EMAIL_PATTERN =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'email',
                (value: unknown) => typeof value === 'string' && DEFAULT_EMAIL_PATTERN.test(value),
                message || `${String(propertyKey)} should be email format`,
            ),
        )
    }
}

const ALPHA_PATTERN = /^[a-zA-Z]+$/

/**
 * Checks if the string contains only alphabetic characters.
 * @param message - Optional custom error message.
 */
export function Alpha(message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'alpha',
                (value: unknown) => typeof value === 'string' && ALPHA_PATTERN.test(value),
                message || `${String(propertyKey)} should be alphabetic`,
            ),
        )
    }
}

const uuidPatterns = {
    all: /^[0-9a-f]{8}-[0-9a-f]{4}-[1345][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    v1: /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    v3: /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    v4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    v5: /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
}

/**
 * Checks if the string is a valid UUID.
 * @param version - The UUID version to check against ('v1', 'v3', 'v4', 'v5', or 'all').
 * @param message - Optional custom error message.
 */
export function Uuid(version?: UuidVersion, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    let regex: RegExp
    let versionLabel: string

    const v = version ? version.replace('v', '') : 'all'

    switch (v) {
        case '1':
            regex = uuidPatterns.v1
            versionLabel = 'v1'
            break
        case '3':
            regex = uuidPatterns.v3
            versionLabel = 'v3'
            break
        case '4':
            regex = uuidPatterns.v4
            versionLabel = 'v4'
            break
        case '5':
            regex = uuidPatterns.v5
            versionLabel = 'v5'
            break
        default:
            regex = uuidPatterns.all
            versionLabel = 'v1, v3, v4, or v5'
    }

    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'uuid',
                (value: unknown) => typeof value === 'string' && regex.test(value),
                message || `${String(propertyKey)} must be a valid UUID format (${versionLabel})`,
            ),
        )
    }
}

/**
 * Checks if the string contains only alphanumeric characters.
 * @param message - Optional custom error message.
 */
export function Alphanumeric(message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'alphanumeric',
                (value: unknown) => typeof value === 'string' && /^[a-zA-Z0-9]+$/.test(value),
                message || `${String(propertyKey)} should be alphanumeric`,
            ),
        )
    }
}

/**
 * Checks if the string contains only uppercase characters.
 * @param message - Optional custom error message.
 */
export function IsUppercase(message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'isUppercase',
                (value: unknown) => typeof value === 'string' && value === value.toUpperCase(),
                message || `${String(propertyKey)} should be uppercase`,
            ),
        )
    }
}

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
                (value: unknown, instance?: Record<string | symbol, any>) => {
                    if (!instance) return false
                    return !(!!value && !!instance?.[fieldName])
                },
                message || `${String(propertyKey)} cannot exist with ${fieldName}`,
            ),
        )
    }
}

/**
 * Applies validation rules to each element of an array.
 * @param args - Validation decorators or functions to apply to each element.
 */
export function Each(...args: (PropertyDecorator | TypedPropertyDecorator<any> | ((value: any) => boolean))[]): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        args.forEach(arg => {
            // Create a temporary class to determine if 'arg' is a decorator
            const tempClass = class {}
            const tempKey = 'temp'
            let rulesAdded: ValidatorRule[] = []

            try {
                // Check the number of validators before applying the decorator
                const tempMetaBefore = new CargoClassMetadata(tempClass.prototype)
                const fieldBefore = tempMetaBefore.getFieldMetadata(tempKey)
                const validatorsBefore = fieldBefore.getValidators().length

                // Attempt to execute as a PropertyDecorator
                ;(arg as PropertyDecorator)(tempClass.prototype, tempKey)

                // Check if a new validator rule has been added
                const tempMetaAfter = new CargoClassMetadata(tempClass.prototype)
                const validatorsAfter = tempMetaAfter.getFieldMetadata(tempKey).getValidators()

                if (validatorsAfter.length > validatorsBefore) {
                    rulesAdded = validatorsAfter.slice(validatorsBefore)
                }
            } catch (e) {
                // Ignore errors if 'arg' is not a valid decorator
            }

            // Wrap the extracted/created rule with EachValidatorRule
            if (rulesAdded.length > 0) {
                rulesAdded.forEach(rule => {
                    fieldMeta.addValidator(new EachValidatorRule(propertyKey, rule))
                })
            } else if (typeof arg === 'function') {
                // If it's not a decorator but a plain function, treat it as a custom validator
                const rule = new ValidatorRule(propertyKey, 'custom', arg as (value: any) => boolean, `Validation failed for ${String(propertyKey)}`)
                fieldMeta.addValidator(new EachValidatorRule(propertyKey, rule))
            }
        })

        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}
