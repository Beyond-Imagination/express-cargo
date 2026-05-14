import { CargoClassMetadata } from '../metadata'
import { ClassConstructor, TypeThunk } from '../types'
import { isClass } from '../utils'
import { ACTIVE_CHECKERS } from './registry'
import { CargoSchemaError } from './errors'
import { RuleContext, RuleViolation } from './types'

// `Object` is included because reflect-metadata falls back to it for unresolvable
// design:type entries — pushing it onto the validation queue is pure waste.
const PRIMITIVE_TYPES = new Set<unknown>([String, Number, Boolean, Date, Object])

/** A value is safe to push onto the validation queue only if it's a class (heuristic) and not a primitive constructor. */
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
            } else {
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
        if (visited.has(currentClass) || VALIDATED.has(currentClass)) continue
        visited.add(currentClass)

        const classMeta = new CargoClassMetadata(currentClass.prototype, true)
        const ctx: RuleContext = { cargoClass: currentClass, classMeta }

        for (const checker of ACTIVE_CHECKERS) {
            violations.push(...checker(ctx))
        }

        for (const nested of collectNestedClasses(classMeta)) {
            if (!visited.has(nested) && !VALIDATED.has(nested)) queue.push(nested)
        }
    }

    if (violations.length > 0) {
        throw new CargoSchemaError(cargoClass, violations)
    }

    // Only on a fully-clean round do we mark classes as validated.
    // Marking incrementally would let a child with violations be cached as "OK" if its parent happened to finish first.
    for (const cls of visited) {
        VALIDATED.add(cls)
    }
}
