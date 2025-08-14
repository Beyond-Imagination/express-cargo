import { Request } from 'express'
import { CargoClassMetadata } from './metadata'

export function transform(transformer: (value: any) => any): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        fieldMeta.setTransformer(transformer)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}

export function request<T>(transformer: (req: Request) => T): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        fieldMeta.setRequestTransformer(transformer)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
        classMeta.setFieldList(propertyKey)
    }
}
