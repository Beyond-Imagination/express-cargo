import { CargoClassMetadata } from './metadata'

export function transform<T>(transformer: (value: T) => T): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        fieldMeta.setTransformer(transformer)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}
