import { CargoClassMetadata } from './metadata'
import { AnalysisResult, ClassConstructor } from './types'
import { isUserDefinedClass, staticTypeTarget } from './utils'

/**
 * Walks the `@Type` / `@List` references on a class's fields and yields every nested class that should also be validated.
 */
function collectNestedClasses(classMeta: CargoClassMetadata): ClassConstructor[] {
    const nested: ClassConstructor[] = []

    for (const propertyKey of classMeta.getAllFieldsList()) {
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        const typeFn = fieldMeta.getTypeFn()
        if (typeFn) {
            // @Type(User) or @Type(() => User); a resolver that reads the request is resolved during binding instead.
            const target = staticTypeTarget(typeFn)
            if (isUserDefinedClass(target)) nested.push(target)

            // Discriminator subTypes are static — but still guard against malformed entries.
            const options = fieldMeta.getTypeOptions()
            if (options?.discriminator) {
                for (const sub of options.discriminator.subTypes) {
                    if (isUserDefinedClass(sub.value)) nested.push(sub.value)
                }
            }
        }

        // @List(Foo) / array element type set by @Type-on-array.
        const elementType = fieldMeta.getArrayElementType()
        if (isUserDefinedClass(elementType)) nested.push(elementType)
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
    if (typeof cargoClass !== 'function') {
        throw new TypeError(`analyzeCargoSchema expects a class constructor, but received ${cargoClass === null ? 'null' : typeof cargoClass}.`)
    }

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
        // resolve() precomputes the merged field lists here, after decoration is complete,
        // so binding-time reads never walk the prototype chain.
        const prototype = currentClass.prototype
        const classMeta = new CargoClassMetadata(prototype && typeof prototype === 'object' ? prototype : {}).resolve()
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
