import { ValidatorRule } from './types'
import { getFieldMetadata, setFieldMetadata } from './metadata'

function addValidator(target: any, propertyKey: string | symbol, rule: ValidatorRule) {
    const meta = getFieldMetadata(target, propertyKey)
    meta.validators = meta.validators || []
    meta.validators.push(rule)
    setFieldMetadata(target, propertyKey, meta)
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
