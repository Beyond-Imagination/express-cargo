import { CargoClassMetadata } from './metadata'

export function transform(transformer: (value: any) => any): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        fieldMeta.setTransformer(transformer)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}

export function virtual(computedFields: (string | symbol)[], transformer: (...value: any[]) => any): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        fieldMeta.setComputedFields(computedFields)
        fieldMeta.setVirtualTransformer(transformer)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
        classMeta.setFieldList(propertyKey)
    }
}
