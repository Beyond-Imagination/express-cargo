import { CargoClassMetadata } from '../metadata'
import { ClassConstructor, TypeThunk } from '../types'
import { ACTIVE_CHECKERS } from './registry'
import { CargoSchemaError } from './errors'
import { RuleContext, RuleViolation } from './types'

const PRIMITIVE_TYPES = new Set<unknown>([String, Number, Boolean, Date])

/**
 * Walks the `@Type` / `@List` references on a class's fields and yields every nested class that should also be validated.
 */
function collectNestedClasses(classMeta: CargoClassMetadata): ClassConstructor[] {
    const nested: ClassConstructor[] = []

    for (const propertyKey of classMeta.getAllFieldsList()) {
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        // @Type(() => Foo) — Thunk form. Resolver form (`(data) => Foo`) can't be evaluated statically;
        // we skip it. Discriminator subTypes ARE static.
        const typeFn = fieldMeta.getTypeFn()
        if (typeFn) {
            try {
                const result = (typeFn as TypeThunk)()
                if (typeof result === 'function') nested.push(result as ClassConstructor)
            } catch {
                // Resolver-shaped functions need runtime data; ignore.
            }

            const options = fieldMeta.getTypeOptions()
            if (options?.discriminator) {
                for (const sub of options.discriminator.subTypes) {
                    if (typeof sub.value === 'function') nested.push(sub.value)
                }
            }
        }

        // @List(Foo) / array element type set by @Type-on-array
        const elementType = fieldMeta.getArrayElementType()
        if (elementType && !PRIMITIVE_TYPES.has(elementType)) {
            nested.push(elementType as ClassConstructor)
        }
    }

    return nested
}

const VALIDATED = new WeakSet<ClassConstructor>()

/**
 * Validates a cargo class (and every nested DTO reachable through `@Type` / `@List`)
 * against the rule checkers registered in {@link ACTIVE_CHECKERS}.
 *
 * The check runs once per class — subsequent calls for the same class are no-ops,
 * so it's safe to invoke from every `bindingCargo()` call.
 *
 * Throws {@link CargoSchemaError} aggregating every violation found.
 *
 * @example
 * ```ts
 * class CreateUser {
 *      // two source decorators on the same field
 *      @Body()
 *      @Query()
 *      id!: number
 * }
 * validateCargoSchema(CreateUser)     // throws CargoSchemaError
 * ```
 */
export function validateCargoSchema(cargoClass: ClassConstructor): void {
    if (VALIDATED.has(cargoClass)) return

    const violations: RuleViolation[] = []
    const visited = new Set<ClassConstructor>()
    const queue: ClassConstructor[] = [cargoClass]

    while (queue.length > 0) {
        const currentClass = queue.shift() as ClassConstructor
        if (visited.has(currentClass)) continue
        visited.add(currentClass)

        const classMeta = new CargoClassMetadata(currentClass.prototype, true)
        const ctx: RuleContext = { cargoClass: currentClass, classMeta }

        for (const checker of ACTIVE_CHECKERS) {
            violations.push(...checker(ctx))
        }

        for (const nested of collectNestedClasses(classMeta)) {
            if (!visited.has(nested)) queue.push(nested)
        }
    }

    if (violations.length > 0) {
        throw new CargoSchemaError(cargoClass, violations)
    }

    VALIDATED.add(cargoClass)
}
