import { CargoClassMetadata } from './metadata'
import { ArrayElementType, TypedPropertyDecorator, TypeOptions, TypeResolver, TypeThunk } from './types'

const TYPE_MAP = {
    string: String,
    number: Number,
    boolean: Boolean,
    date: Date,
} as const

export function Optional(): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        fieldMeta.setOptional(true)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}

export function Array(elementType: ArrayElementType): TypedPropertyDecorator<Array<unknown>> {
    return (target: any, propertyKey: string | symbol) => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        const actualType = typeof elementType === 'string' ? TYPE_MAP[elementType] : elementType
        fieldMeta.setArrayElementType(actualType)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}

export function Default(value: any): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        fieldMeta.setDefault(value)
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}

/**
 * Decorator to define the target class type for a property.
 * * Supports three strategies:
 * 1. **Thunk**: `() => Class` (Static types & circular refs)
 * 2. **Resolver**: `(data) => Class` (Dynamic polymorphism)
 * 3. **Discriminator**: Structural mapping via `options.discriminator`.
 * @param typeFn - A function returning the target class (Thunk or Resolver).
 * @param options - Additional configuration for type resolution.
 * @returns {PropertyDecorator}
 * @example
 * ```ts
 * class Example {
 *      // Basic usage with Thunk
 *      @Type(() => User)
 *      user!: User;
 *
 *      // Dynamic resolution (Polymorphism)
 *      @Type((data) => data.type === 'video' ? Video : Photo)
 *      content!: Video | Photo;
 *
 *      // Discriminator usage
 *      @Type(() => Shape, {
 *          discriminator: {
 *              property: 'kind',
 *              subTypes: [
 *                  { name: 'circle', value: Circle },
 *                  { name: 'square', value: Square },
 *              ],
 *          },
 *      })
 *      shapes!: Shape[];
 * }
 * ```
 */
export function Type(typeFn: TypeThunk | TypeResolver, options?: TypeOptions): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        fieldMeta.setTypeInfo(typeFn, options)

        const designType = Reflect.getMetadata('design:type', target, propertyKey)
        const isArrayType = designType === Array || (typeof designType === 'function' && designType.name === 'Array')
        if (isArrayType) {
            try {
                const potentialClass = (typeFn as TypeThunk)()
                if (typeof potentialClass === 'function') fieldMeta.setArrayElementType(potentialClass)
            } catch (e) {
                // If execution fails, it's likely a Resolver that requires 'data'.
                // We skip pre-determination and handle it dynamically in the typeCasting phase.
            }
        }

        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}
