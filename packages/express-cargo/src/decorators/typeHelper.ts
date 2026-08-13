import { CargoClassMetadata } from '../metadata'
import { ArrayElementType, CargoErrorMessage, TypedPropertyDecorator, TypeOptions, TypeResolver, TypeThunk } from '../types'
import { ValidatorRule } from '../validatorRule'

const TYPE_MAP = {
    string: String,
    number: Number,
    boolean: Boolean,
    date: Date,
} as const

/**
 * Specifies the type of elements in an array property.
 * @param elementType - The constructor or type name of the array elements.
 */
export function List(elementType: ArrayElementType): TypedPropertyDecorator<Array<unknown>> {
    return (target: any, propertyKey: string | symbol) => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)
        const actualType = typeof elementType === 'string' ? TYPE_MAP[elementType] : elementType
        fieldMeta.setArrayElementType(actualType)
        fieldMeta.pushAppliedDecorator({ name: List.name, category: 'type-helper', args: [elementType] })
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}

/**
 * Decorator to define the target class type for a property.
 * Supports three strategies:
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
        fieldMeta.pushAppliedDecorator({ name: Type.name, category: 'type-helper', args: [typeFn, options] })

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

/**
 * Decorator that validates if the property value is a valid enum member.
 * It also transforms the input value to the corresponding enum value if possible.
 *
 * @param enumObj - The enum object to validate against.
 * @param message - Optional custom error message or function.
 * @returns A property decorator.
 *
 * @example
 * ```typescript
 * enum UserRole {
 *   ADMIN = 'admin',
 *   USER = 'user'
 * }
 *
 * class User {
 *   @Enum(UserRole)
 *   role: UserRole;
 * }
 * ```
 */
export function Enum<T>(enumObj: any, message?: CargoErrorMessage): TypedPropertyDecorator<T> {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        const enumKeys = Object.keys(enumObj).filter(k => isNaN(Number(k)))
        const enumValues = enumKeys.map(k => enumObj[k as keyof typeof enumObj])
        const validInputs = [...enumKeys, ...enumValues]

        // 1. Store the enum type information
        fieldMeta.setEnumType(enumObj)
        fieldMeta.pushAppliedDecorator({ name: Enum.name, category: 'type-helper', args: [enumObj, message] })

        // 2. Add the enum validator
        fieldMeta.addValidator(
            new ValidatorRule(
                propertyKey,
                'enum',
                input => validInputs.some(v => String(v) === String(input)),
                message || `${String(propertyKey)} must be one of: ${enumValues.join(', ')}`,
            ),
        )

        // 3. Add the enum transformer
        const transformer = (value: any): any => {
            if (value === null || value === undefined) return value

            // 1. When the input is an enum key (e.g. 'ADMIN')
            if (typeof value === 'string' && enumKeys.includes(value)) {
                return enumObj[value as keyof typeof enumObj]
            }

            // Convert a numeric string to a number for comparison
            const comparableValue = typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value

            // 2. When the input is an enum value (e.g. 0 or 'admin')
            for (const key of enumKeys) {
                if (enumObj[key as keyof typeof enumObj] === comparableValue) {
                    return comparableValue
                }
            }

            return value
        }
        fieldMeta.setTransformer(transformer)

        // Store the metadata
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}
