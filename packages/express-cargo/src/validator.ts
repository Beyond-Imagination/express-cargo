import { cargoErrorMessage, TypedPropertyDecorator, UuidVersion, ValidatorRule } from './types'
import { CargoClassMetadata } from './metadata'

function addValidator(target: any, propertyKey: string | symbol, rule: ValidatorRule) {
    const classMeta = new CargoClassMetadata(target)
    const fieldMeta = classMeta.getFieldMetadata(propertyKey)
    fieldMeta.addValidator(rule)
    classMeta.setFieldMetadata(propertyKey, fieldMeta)
}

export function Min(minimum: number, message?: cargoErrorMessage): TypedPropertyDecorator<number> {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'min',
            input => typeof input === 'number' && input >= minimum,
            message || `${String(propertyKey)} must be >= ${minimum}`,
        ))
    }
}

export function Max(maximum: number, message?: cargoErrorMessage): TypedPropertyDecorator<number> {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'max',
            input => typeof input === 'number' && input <= maximum,
            message || `${String(propertyKey)} must be <= ${maximum}`,
        ))
    }
}

export function Prefix(prefixText: string, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'prefix',
            val => typeof val === 'string' && val.startsWith(prefixText),
            message || `${String(propertyKey)} must start with ${prefixText}`,
        ))
    }
}

export function Suffix(suffixText: string, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'suffix',
            val => typeof val === 'string' && val.endsWith(suffixText),
            message || `${String(propertyKey)} must end with ${suffixText}`,
        ))
    }
}

export function Equal(value: any, message?: cargoErrorMessage): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'equal',
            val => val === value,
            message || `${String(propertyKey)} must be equal to ${value}`,
        ))
    }
}

export function NotEqual(value: any, message?: cargoErrorMessage): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'notEqual',
            val => val !== value,
            message || `${String(propertyKey)} must not be equal to ${value}`,
        ))
    }
}

export function Range(min: number, max: number, message?: cargoErrorMessage): TypedPropertyDecorator<number> {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'range',
            value => typeof value === 'number' && value >= min && value <= max,
            message || `${String(propertyKey)} must be between ${min} and ${max}`,
        ))
    }
}

export function IsFalse(message?: cargoErrorMessage): TypedPropertyDecorator<boolean> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'isFalse',
            val => val === false,
            message || `${String(propertyKey)} must be false`,
        ))
    }
}

export function IsTrue(message?: cargoErrorMessage): TypedPropertyDecorator<boolean> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'isTrue',
            val => val === true,
            message || `${String(propertyKey)} must be true`,
        ))
    }
}

export function Length(value: number, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'length',
            (val: any) => typeof val === 'string' && val.length === value,
            message || `${String(propertyKey)} must be ${value} characters`,
        ))
    }
}

export function MaxLength(max: number, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'maxLength',
            (val: any) => typeof val === 'string' && val.length <= max,
            message || `${String(propertyKey)} must not exceed ${max} characters`,
        ))
    }
}

export function MinLength(min: number, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
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
export function OneOf<T extends readonly any[]>(options: T, message?: cargoErrorMessage): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'oneOf',
            (value: unknown): value is T[number] => options.includes(value as T[number]),
            message || `${String(propertyKey)} must be one of ${options.join(', ')}`,
        ))
    }
}

export function Validate(validateFn: (value: unknown) => boolean, message?: cargoErrorMessage): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'validate',
            validateFn,
            message || `${String(propertyKey)} did not pass the provided validation rule.`,
        ))
    }
}

export function Regexp(pattern: RegExp, message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'regexp',
            (value: unknown) => typeof value === 'string' && pattern.test(value),
            message || `${String(propertyKey)} does not match pattern ${pattern}`,
        ))
    }
}

export function Email(message?: cargoErrorMessage): TypedPropertyDecorator<string> {
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
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'uuid',
            (value: unknown) => typeof value === 'string' && regex.test(value),
            message || `${String(propertyKey)} must be a valid UUID format (${versionLabel})`,
        ))
    }
}

export function Alphanumeric(message?: cargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(target, propertyKey, new ValidatorRule(
            propertyKey,
            'alphanumeric',
            (value: unknown) => typeof value === 'string' && /^[a-zA-Z0-9]+$/.test(value),
            message || `${String(propertyKey)} should be alphanumeric`,
        ))
    }
}

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
