import { cargoErrorMessage, TypedPropertyDecorator, UuidVersion, ValidatorRule } from './types'
import { CargoClassMetadata } from './metadata'

function addValidator(target: any, propertyKey: string | symbol, rule: ValidatorRule) {
    const classMeta = new CargoClassMetadata(target)
    const fieldMeta = classMeta.getFieldMetadata(propertyKey)
    fieldMeta.addValidator(rule)
    classMeta.setFieldMetadata(propertyKey, fieldMeta)
}

export function min(minimum: number, message?: cargoErrorMessage): TypedPropertyDecorator<number> {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'min',
            input => typeof input === 'number' && input >= minimum,
            message || `${String(propertyKey)} must be >= ${minimum}`,
        ))
    }
}

export function max(maximum: number, message?: cargoErrorMessage): TypedPropertyDecorator<number> {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'max',
            input => typeof input === 'number' && input <= maximum,
            message || `${String(propertyKey)} must be <= ${maximum}`,
        ))
    }
}

export function prefix(prefixText: string, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'prefix',
            val => typeof val === 'string' && val.startsWith(prefixText),
            message || `${String(propertyKey)} must start with ${prefixText}`,
        ))
    }
}

export function suffix(suffixText: string, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'suffix',
            val => typeof val === 'string' && val.endsWith(suffixText),
            message || `${String(propertyKey)} must end with ${suffixText}`,
        ))
    }
}

export function equal(value: any, message?: cargoErrorMessage): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'equal',
            val => val === value,
            message || `${String(propertyKey)} must be equal to ${value}`,
        ))
    }
}

export function notEqual(value: any, message?: cargoErrorMessage): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'notEqual',
            val => val !== value,
            message || `${String(propertyKey)} must not be equal to ${value}`,
        ))
    }
}

export function range(min: number, max: number, message?: cargoErrorMessage): TypedPropertyDecorator<number> {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'range',
            value => typeof value === 'number' && value >= min && value <= max,
            message || `${String(propertyKey)} must be between ${min} and ${max}`,
        ))
    }
}

export function isFalse(message?: cargoErrorMessage): TypedPropertyDecorator<boolean> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'isFalse',
            val => val === false,
            message || `${String(propertyKey)} must be false`,
        ))
    }
}

export function isTrue(message?: cargoErrorMessage): TypedPropertyDecorator<boolean> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'isTrue',
            val => val === true,
            message || `${String(propertyKey)} must be true`,
        ))
    }
}

export function length(value: number, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'length',
            (val: any) => typeof val === 'string' && val.length === value,
            message || `${String(propertyKey)} must be ${value} characters`,
        ))
    }
}

export function maxLength(max: number, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'maxLength',
            (val: any) => typeof val === 'string' && val.length <= max,
            message || `${String(propertyKey)} must not exceed ${max} characters`,
        ))
    }
}

export function minLength(min: number, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'minLength',
            (val: any) => typeof val === 'string' && val.length >= min,
            message || `${String(propertyKey)} must be at least ${min} characters`,
        ))
    }
}

/**
 * 속성 값이 주어진 값들 중 하나인지 확인합니다.
 * @param options 허용되는 값의 배열.
 */
export function oneOf<T extends readonly any[]>(options: T, message?: cargoErrorMessage): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'oneOf',
            (value: unknown): value is T[number] => options.includes(value as T[number]),
            message || `${String(propertyKey)} must be one of ${options.join(', ')}`,
        ))
    }
}

export function validate(validateFn: (value: unknown) => boolean, message?: cargoErrorMessage): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'validate',
            validateFn,
            message || `${String(propertyKey)} did not pass the provided validation rule.`,
        ))
    }
}

export function regexp(pattern: RegExp, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'regexp',
            (value: unknown) => typeof value === 'string' && pattern.test(value),
            message || `${String(propertyKey)} does not match pattern ${pattern}`,
        ))
    }
}

export function email(message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        const DEFAULT_EMAIL_PATTERN =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'email',
            (value: unknown) => typeof value === 'string' && DEFAULT_EMAIL_PATTERN.test(value),
            message || `${String(propertyKey)} should be email format`,
        ))
    }
}

const ALPHA_PATTERN = /^[a-zA-Z]+$/

export function isAlpha(message?: cargoErrorMessage): TypedPropertyDecorator<string> {
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

export function uuid(version?: UuidVersion, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
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
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'uuid',
            (value: unknown) => typeof value === 'string' && regex.test(value),
            message || `${String(propertyKey)} must be a valid UUID format (${versionLabel})`,
        ))
    }
}

export function alphanumeric(message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'alphanumeric',
            (value: unknown) => typeof value === 'string' && /^[a-zA-Z0-9]+$/.test(value),
            message || `${String(propertyKey)} should be alphanumeric`,
        ))
    }
}
