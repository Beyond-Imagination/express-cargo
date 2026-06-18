import { CargoClassMetadata } from './metadata'
import { cargoErrorMessage, TypedPropertyDecorator, ValidatorRule } from './types'

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
export function Enum<T>(enumObj: any, message?: cargoErrorMessage): TypedPropertyDecorator<T> {
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

            const enumKeys = Object.keys(enumObj).filter(k => isNaN(Number(k)))

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
