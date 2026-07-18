import { CargoClassMetadata } from '../metadata'

/**
 * Marks a property as optional.
 * If the property is missing in the request, it will be ignored during validation.
 */
export function Optional(): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        fieldMeta.setOptional(true)
        fieldMeta.pushAppliedDecorator({ name: Optional.name, category: 'missing-handler', args: [] })
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}

/**
 * Sets a default value for a property if it is missing or undefined in the request.
 * @param value - The default value to use.
 */
export function Default(value: any): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        fieldMeta.setDefault(value)
        fieldMeta.pushAppliedDecorator({ name: Default.name, category: 'missing-handler', args: [value] })
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}
