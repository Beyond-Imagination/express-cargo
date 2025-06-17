import { ValidatorRule } from './types'
import { getFieldMetadata, setFieldMetadata } from './metadata'

function addValidator(target: any, propertyKey: string | symbol, rule: ValidatorRule) {
    const meta = getFieldMetadata(target, propertyKey)
    meta.validators = meta.validators || []
    meta.validators.push(rule)
    setFieldMetadata(target, propertyKey, meta)
}

export function min(value: number): PropertyDecorator {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, {
            type: 'min',
            validate: val => typeof val === 'number' && val >= value,
            message: `${String(propertyKey)} must be >= ${value}`,
        })
    }
}

export function max(value: number): PropertyDecorator {
    return (target, propertyKey) => {
        addValidator(target, propertyKey, {
            type: 'max',
            validate: val => typeof val === 'number' && val <= value,
            message: `${String(propertyKey)} must be <= ${value}`,
        })
    }
}
