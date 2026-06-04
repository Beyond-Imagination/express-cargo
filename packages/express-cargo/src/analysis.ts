import { CargoClassMetadata } from './metadata'
import { AnalysisResult, ClassConstructor, TypeThunk } from './types'
import { isClass } from './utils'

// `Object` is included because reflect-metadata falls back to it for unresolvable
// design:type entries; `Array` guards against a malformed `@List(Array)`.
// Both pass the isClass heuristic but should never be descended into.
const PRIMITIVE_TYPES = new Set<unknown>([String, Number, Boolean, Date, Object, Array])

/** A value is safe to traverse during schema validation only if it's a class (heuristic) and not a primitive constructor. */
function isValidatableClass(value: unknown): value is ClassConstructor {
    return isClass(value) && !PRIMITIVE_TYPES.has(value)
}

/**
 * Walks the `@Type` / `@List` references on a class's fields and yields every nested class that should also be validated.
 */
function collectNestedClasses(classMeta: CargoClassMetadata): ClassConstructor[] {
    const nested: ClassConstructor[] = []

    for (const propertyKey of classMeta.getAllFieldsList()) {
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        const typeFn = fieldMeta.getTypeFn()
        if (typeFn) {
            // @Type(User) — class passed directly. Calling it as a Thunk would throw
            // (ES6 class can't be invoked without `new`), so handle it before the Thunk path.
            if (isValidatableClass(typeFn)) {
                nested.push(typeFn)
            } else if (typeFn.length === 0) {
                // @Type(() => Foo) — Thunk form. Resolver form (`(data) => Foo`) can't be
                // evaluated statically and will throw on the no-arg call; we catch and skip.
                try {
                    const result = (typeFn as TypeThunk)()
                    if (isValidatableClass(result)) nested.push(result)
                } catch {
                    // Resolver-shaped functions need runtime data; ignore.
                }
            }

            // Discriminator subTypes are static — but still guard against malformed entries.
            const options = fieldMeta.getTypeOptions()
            if (options?.discriminator) {
                for (const sub of options.discriminator.subTypes) {
                    if (isValidatableClass(sub.value)) nested.push(sub.value)
                }
            }
        }

        // @List(Foo) / array element type set by @Type-on-array.
        const elementType = fieldMeta.getArrayElementType()
        if (isValidatableClass(elementType)) nested.push(elementType)
    }

    return nested
}

const ANALYSIS_CACHE = new WeakMap<ClassConstructor, AnalysisResult>()

/**
 * Recursively analyzes a cargo class and all its nested DTOs.
 * Returns an AnalysisResult containing metadata for all discovered classes.
 *
 * This function caches its results, so subsequent calls for the same class are free.
 */
export function analyzeCargoSchema(cargoClass: ClassConstructor): AnalysisResult {
    const cached = ANALYSIS_CACHE.get(cargoClass)
    if (cached) return cached

    const metadataMap = new Map<ClassConstructor, CargoClassMetadata>()
    const visited = new Set<ClassConstructor>()
    const stack: ClassConstructor[] = [cargoClass]

    while (stack.length > 0) {
        const currentClass = stack.pop() as ClassConstructor
        if (visited.has(currentClass)) continue
        visited.add(currentClass)

        // Metadata is collected once per class and shared across all contexts.
        const prototype = currentClass.prototype
        const classMeta = new CargoClassMetadata(prototype && typeof prototype === 'object' ? prototype : {}, true)
        metadataMap.set(currentClass, classMeta)

        for (const nested of collectNestedClasses(classMeta)) {
            if (!visited.has(nested)) stack.push(nested)
        }
    }

    const result: AnalysisResult = {
        rootClass: cargoClass,
        rootMeta: metadataMap.get(cargoClass)!,
        metadataMap,
    }

    ANALYSIS_CACHE.set(cargoClass, result)
    return result
}
