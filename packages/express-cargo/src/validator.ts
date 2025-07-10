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

export function prefix(value: string): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(target, propertyKey, {
            type: 'prefix',
            validate: val => typeof val === 'string' && val.startsWith(value),
            message: `${String(propertyKey)} must start with ${value}`,
        })
    }
}

export function suffix(value: string): PropertyDecorator {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, {
            type: 'suffix',
            validate: val => typeof val === 'string' && val.endsWith(value),
            message: `${String(propertyKey)} must end with ${value}`,
        })
    }
}
