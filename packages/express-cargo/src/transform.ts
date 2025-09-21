import type { Request } from 'express'
import { CargoClassMetadata } from './metadata'
import { TypedPropertyDecorator } from './types'

export function transform<T>(transformer: (value: T) => T): TypedPropertyDecorator<T> {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        fieldMeta.setTransformer(transformer)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}

export function request<T>(transformer: (req: Request) => T): TypedPropertyDecorator<T> {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        fieldMeta.setRequestTransformer(transformer)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
        classMeta.setRequestFieldList(propertyKey)
    }
}

export function virtual<T>(transformer: (obj: any) => T): TypedPropertyDecorator<T> {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        fieldMeta.setVirtualTransformer(transformer)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
        classMeta.setVirtualFieldList(propertyKey)
    }
}
