import { ArrayComparator, cargoErrorMessage, TypedPropertyDecorator } from '../../types'
import { EachValidatorRule, ValidatorRule } from '../../validatorRule'
import { CargoClassMetadata } from '../../metadata'
import { isDeepEqual } from '../../utils'
import { addValidator } from './addValidator'

/**
 * Checks if the array contains all the specified values.
 * @param values - The values that must be present in the array.
 * @param comparator - Optional custom comparison function (expected, actual) => boolean.
 *                     When provided, all comparisons are delegated to this function,
 *                     including primitives.
 * @param message - Optional custom error message.
 */
export function ListContains(values: any[], comparator?: ArrayComparator, message?: cargoErrorMessage): TypedPropertyDecorator<any[]> {
    // Pre-split only when using default comparison (Set + deepEqual optimization)
    const expectedPrimitives = !comparator ? values.filter(v => v === null || typeof v !== 'object') : []
    const expectedObjects = !comparator ? values.filter(v => v !== null && typeof v === 'object') : []

    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'listContains',
                (value: unknown) => {
                    if (!Array.isArray(value)) {
                        return false
                    }

                    // Delegate all comparisons to the custom comparator, including primitives
                    if (comparator) {
                        return values.every(expected => value.some(actual => comparator(expected, actual)))
                    }

                    const actualPrimitiveSet = new Set()
                    const actualObjects: any[] = []

                    for (const item of value) {
                        if (item === null || typeof item !== 'object') {
                            actualPrimitiveSet.add(item)
                        } else {
                            actualObjects.push(item)
                        }
                    }

                    // Verify all expected primitive values exist in the actual array
                    for (const req of expectedPrimitives) {
                        if (!actualPrimitiveSet.has(req)) return false
                    }

                    // Verify all expected objects exist in the actual array using deep equality
                    for (const reqObj of expectedObjects) {
                        const found = actualObjects.some(actObj => isDeepEqual(reqObj, actObj))
                        if (!found) return false
                    }

                    return true
                },
                message || `${String(propertyKey)} must contain all specified values`,
            ),
        )
    }
}

/**
 * Validates that the array does NOT contain any of the specified values.
 * Supports primitives, objects (deep equality), Date values, and custom comparators.
 * @param values - The values that must NOT be present in the array.
 * @param comparator - Optional custom comparison function for comparing values,
 *                     including primitives.
 * @param message - Optional custom error message.
 */
export function ListNotContains(values: any[], comparator?: ArrayComparator, message?: cargoErrorMessage): TypedPropertyDecorator<any[]> {
    // Pre-split only when using default comparison (Set + deepEqual optimization)
    const excludedPrimitives = !comparator ? values.filter(v => v === null || typeof v !== 'object') : []
    const excludedObjects = !comparator ? values.filter(v => v !== null && typeof v === 'object') : []

    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'listNotContains',
                (value: unknown) => {
                    if (!Array.isArray(value)) {
                        return false
                    }

                    // Delegate all comparisons to the custom comparator, including primitives
                    if (comparator) {
                        return values.every(excluded => !value.some(actual => comparator(excluded, actual)))
                    }

                    const actualPrimitiveSet = new Set()
                    const actualObjects: any[] = []

                    for (const item of value) {
                        if (item === null || typeof item !== 'object') {
                            actualPrimitiveSet.add(item)
                        } else {
                            actualObjects.push(item)
                        }
                    }

                    // Verify none of the excluded primitive values exist in the actual array
                    for (const exc of excludedPrimitives) {
                        if (actualPrimitiveSet.has(exc)) return false
                    }

                    // Verify none of the excluded objects exist in the actual array using deep equality
                    for (const excObj of excludedObjects) {
                        const found = actualObjects.some(actObj => isDeepEqual(excObj, actObj))
                        if (found) return false
                    }

                    return true
                },
                message || `${String(propertyKey)} must not contain any of the excluded values`,
            ),
        )
    }
}

/**
 * Checks if the array length does not exceed the specified maximum size.
 * @param max - The maximum number of elements allowed in the array.
 * @param message - Optional custom error message.
 */
export function ListMaxSize(max: number, message?: cargoErrorMessage): TypedPropertyDecorator<any[]> {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'listMaxSize',
                (value: unknown) => Array.isArray(value) && value.length <= max,
                message || `${String(propertyKey)} must contain no more than ${max} elements`,
            ),
        )
    }
}

/**
 * Checks if the array length does not fall below the specified minimum size.
 * @param min - The minimum number of elements allowed in the array.
 * @param message - Optional custom error message.
 */
export function ListMinSize(min: number, message?: cargoErrorMessage): TypedPropertyDecorator<any[]> {
    return (target: Object, propertyKey: string | symbol): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'listMinSize',
                (value: unknown) => Array.isArray(value) && value.length >= min,
                message || `${String(propertyKey)} must contain at least ${min} elements`,
            ),
        )
    }
}

/**
 * Applies validation rules to each element of an array.
 * @param args - Validation decorators or functions to apply to each element.
 */
export function Each(...args: (PropertyDecorator | TypedPropertyDecorator<any> | ((value: any) => boolean))[]): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        args.forEach(arg => {
            // Create a temporary class to determine if 'arg' is a decorator
            const tempClass = class {}
            const tempKey = 'temp'
            let rulesAdded: ValidatorRule[] = []

            try {
                // Check the number of validators before applying the decorator
                const tempMetaBefore = new CargoClassMetadata(tempClass.prototype)
                const fieldBefore = tempMetaBefore.getFieldMetadata(tempKey)
                const validatorsBefore = fieldBefore.getValidators().length

                // Attempt to execute as a PropertyDecorator
                ;(arg as PropertyDecorator)(tempClass.prototype, tempKey)

                // Check if a new validator rule has been added
                const tempMetaAfter = new CargoClassMetadata(tempClass.prototype)
                const tempFieldAfter = tempMetaAfter.getFieldMetadata(tempKey)
                const validatorsAfter = tempFieldAfter.getValidators()

                if (validatorsAfter.length > validatorsBefore) {
                    rulesAdded = validatorsAfter.slice(validatorsBefore)
                }

                // Record any decorator tags applied by `arg` so schema-validation rule checkers can inspect what was nested inside `@Each`.
                tempFieldAfter.getAppliedDecorators().forEach(tag => fieldMeta.pushAppliedDecorator(tag, 'each'))
            } catch (e) {
                // Ignore errors if 'arg' is not a valid decorator
            }

            // Wrap the extracted/created rule with EachValidatorRule
            if (rulesAdded.length > 0) {
                rulesAdded.forEach(rule => {
                    fieldMeta.addValidator(new EachValidatorRule(propertyKey, rule))
                })
            } else if (typeof arg === 'function') {
                // If it's not a decorator but a plain function, treat it as a custom validator
                const rule = new ValidatorRule(propertyKey, 'custom', arg as (value: any) => boolean, `Validation failed for ${String(propertyKey)}`)
                fieldMeta.addValidator(new EachValidatorRule(propertyKey, rule))
            }
        })

        fieldMeta.pushAppliedDecorator({ name: Each.name, category: 'validator', args })
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}
