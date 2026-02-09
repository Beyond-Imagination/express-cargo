import type { Request } from 'express'
import { CargoClassMetadata } from './metadata'
import { TypedPropertyDecorator } from './types'

/**
 * Transforms the property value using a custom function.
 * @param transformer - A function that takes the raw value and returns the transformed value.
 * @example
 * ```ts
 *  @Transform((val: string) => val.trim())
 *  name: string;
 * ```
 */
export function Transform<T>(transformer: (value: T) => T): TypedPropertyDecorator<T> {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        fieldMeta.setTransformer(transformer)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}

/**
 * Injects a value from the Express Request object directly into the property.
 * @param transformer - A function that receives the Express Request and returns the desired value.
 * @example
 * ```ts
 *  @Request((req) => req?.headers['x-custom-header'] as string)
 *  clientIp: string;
 * ```
 */
export function Request<T>(transformer: (req: Request) => T): TypedPropertyDecorator<T> {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        fieldMeta.setRequestTransformer(transformer)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
        classMeta.setRequestFieldList(propertyKey)
    }
}

/**
 * Defines a virtual property that is calculated based on other properties of the instance.
 * @remarks
 * **Important:** This property must be declared **after** all the properties it depends on.
 * Since decorators are evaluated in the order they are defined, accessing a property
 * declared below the virtual property will result in `undefined`.
 * @param transformer - A function that receives the current object instance.
 * @example
 * ```ts
 *  @Virtual((obj) => `${obj.firstName} ${obj.lastName}`)
 *  fullName: string;
 * ```
 */
export function Virtual<T>(transformer: (obj: any) => T): TypedPropertyDecorator<T> {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        fieldMeta.setVirtualTransformer(transformer)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
        classMeta.setVirtualFieldList(propertyKey)
    }
}
