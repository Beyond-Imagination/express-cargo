import { CargoClassMetadata } from './metadata'
import { ArrayElementType, TypedPropertyDecorator } from './types'

const TYPE_MAP = {
    string: String,
    number: Number,
    boolean: Boolean,
    date: Date,
} as const

export function optional(): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        fieldMeta.setOptional(true)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}

export function array(elementType: ArrayElementType): TypedPropertyDecorator<Array<unknown>> {
    return (target: any, propertyKey: string | symbol) => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        const actualType = typeof elementType === 'string' ? TYPE_MAP[elementType] : elementType
        fieldMeta.setArrayElementType(actualType)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}

export function defaultValue(value: any) {
    return function (target: any, propertyKey: string | symbol) {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        fieldMeta.setDefault(value)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}
