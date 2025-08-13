import { ValidatorRule } from './types'
import { CargoClassMetadata } from './metadata'

function addValidator(target: any, propertyKey: string | symbol, rule: ValidatorRule) {
    const classMeta = new CargoClassMetadata(target)
    const fieldMeta = classMeta.getFieldMetadata(propertyKey)
    fieldMeta.addValidator(rule)
    classMeta.setFieldMetadata(propertyKey, fieldMeta)
}

export function min(minimum: number): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'min',
            validate: input => typeof input === 'number' && input >= minimum,
            message: `${String(propertyKey)} must be >= ${minimum}`,
        })
    }
}

export function max(maximum: number): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'max',
            validate: input => typeof input === 'number' && input <= maximum,
            message: `${String(propertyKey)} must be <= ${maximum}`,
        })
    }
}

export function prefix(prefixText: string): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'prefix',
            validate: val => typeof val === 'string' && val.startsWith(prefixText),
            message: `${String(propertyKey)} must start with ${prefixText}`,
        })
    }
}

export function suffix(suffixText: string): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        addValidator(target, propertyKey, {
            type: 'suffix',
            validate: val => typeof val === 'string' && val.endsWith(suffixText),
            message: `${String(propertyKey)} must end with ${suffixText}`,
        })
    }
}

export function equal(value: any): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'equal',
            validate: val => val === value,
            message: `${String(propertyKey)} must be equal to ${value}`,
        })
    }
}

export function notEqual(value: any): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'notEqual',
            validate: val => val !== value,
            message: `${String(propertyKey)} must not be equal to ${value}`,
        })
    }
}

export function range(min: number, max: number): PropertyDecorator {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, {
            type: 'range',
            validate: (value: any) => typeof value === 'number' && value >= min && value <= max,
            message: `${String(propertyKey)} must be between ${min} and ${max}`,
        })
    }
}

export function isFalse(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'isFalse',
            validate: val => val === false,
            message: `${String(propertyKey)} must be false`,
        })
    }
}

export function isTrue(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'isTrue',
            validate: val => val === true,
            message: `${String(propertyKey)} must be true`,
        })
    }
}

export function maxLength(max: number): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'maxLength',
            validate: (val: any) => typeof val === 'string' && val.length <= max,
            message: `${String(propertyKey)} must not exceed ${max} characters`,
        })
    }
}

export function minLength(min: number): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'minLength',
            validate: (val: any) => typeof val === 'string' && val.length >= min,
            message: `${String(propertyKey)} must be at least ${min} characters`,
        })
    }
}

/**
 * 속성 값이 주어진 값들 중 하나인지 확인합니다.
 * @param options 허용되는 값의 배열.
 */
export function oneOf<T extends readonly any[]>(options: T): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'oneOf',
            validate: (value: unknown): value is T[number] => options.includes(value as T[number]),
            message: `${String(propertyKey)} must be one of ${options.join(', ')}`,
        })
    }
}

export function validate(validateFn: (value: unknown) => boolean, message: string): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'validate',
            validate: validateFn,
            message: message,
        })
    }
}

export function regexp(pattern: RegExp, message?: string) {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'regexp',
            validate: (value: unknown) => typeof value === 'string' && pattern.test(value),
            message: message || `${String(propertyKey)} does not match pattern ${pattern}`,
        })
    }
}
