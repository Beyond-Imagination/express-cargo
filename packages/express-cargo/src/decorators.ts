import { CargoClassMetadata } from './metadata'

export function optional(): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        fieldMeta.setOptional(true)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}
