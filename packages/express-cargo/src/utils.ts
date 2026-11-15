import { ClassConstructor } from './types'
import { adapterForType, adapterForValue, equalsDateLike, temporalTypeName } from './dateLike'

const IS_CLASS_CACHE = new WeakMap<object, boolean>()

/**
 * Determines if a given function is a class constructor.
 * This is a heuristic check to support various transpilation environments (ES6+, Babel, etc.).
 */
export function isClass(fn: unknown): fn is new (...args: any[]) => any {
    if (typeof fn !== 'function') return false

    // Cached because the check stringifies the whole class source on every call.
    let verdict = IS_CLASS_CACHE.get(fn)
    if (verdict === undefined) {
        verdict = computeIsClass(fn as (...args: unknown[]) => unknown)
        IS_CLASS_CACHE.set(fn, verdict)
    }
    return verdict
}

function computeIsClass(fn: (...args: unknown[]) => unknown): boolean {
    // Standard ES6 class declaration starts with 'class '
    if (fn.toString().startsWith('class ')) return true

    // Arrow functions and bound functions may not have a prototype
    if (!fn.prototype) return false

    // Heuristic: PascalCase naming and a valid constructor link usually indicate a class
    const hasPrototype = fn.prototype && fn.prototype.constructor === fn
    const isPascalCase = fn.name && /^[A-Z]/.test(fn.name)
    return Boolean(isPascalCase && hasPrototype)
}

/**
 * The class a `@Type` argument names when it is known without request data: the class itself, or what a
 * zero-argument thunk returns. Undefined for a resolver that reads the request, or a thunk that throws.
 */
export function staticTypeTarget(typeFn: unknown): ClassConstructor | undefined {
    if (isClass(typeFn)) return typeFn
    if (typeof typeFn !== 'function' || typeFn.length !== 0) return undefined
    try {
        const resolved = typeFn()
        return typeof resolved === 'function' ? resolved : undefined
    } catch {
        return undefined
    }
}

// `Object` is included because reflect-metadata falls back to it for unresolvable
// design:type entries; `Array` guards against a malformed `@List(Array)`.
// Both pass the isClass heuristic but should never be descended into.
// Date-like types (`Date`) are leaves too; their adapters decide that.
const NON_DESCENDABLE_TYPES = new Set<unknown>([String, Number, Boolean, Object, Array])

// Cached because binding asks this for every nested object and list element class on each request.
const IS_USER_DEFINED_CLASS_CACHE = new WeakMap<object, boolean>()

/**
 * Returns true when a value is a user-defined class worth descending into (a nested DTO),
 * excluding the built-in constructors that pass the {@link isClass} heuristic but must be
 * treated as leaves. Shared by schema analysis (traversal) and binding (recursive binding).
 */
export function isUserDefinedClass(value: unknown): value is ClassConstructor {
    if (typeof value !== 'function') return false

    let verdict = IS_USER_DEFINED_CLASS_CACHE.get(value)
    if (verdict === undefined) {
        // Temporal types are leaves even where they are unsupported; a schema rule reports those instead.
        verdict = isClass(value) && !NON_DESCENDABLE_TYPES.has(value) && !adapterForType(value) && temporalTypeName(value) === undefined
        IS_USER_DEFINED_CLASS_CACHE.set(value, verdict)
    }
    return verdict
}

function isPlainOrArray(value: object): boolean {
    return Array.isArray(value) || value.constructor === Object
}

export function isDeepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true

    const stack: [any, any][] = [[obj1, obj2]]
    while (stack.length > 0) {
        const [a, b] = stack.pop()!

        if (a === b) continue
        if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
            return false
        }

        // Date-like values equal only the same kind and value, never `{}`. Plain objects and arrays skip the lookup.
        if (!isPlainOrArray(a) || !isPlainOrArray(b)) {
            if (adapterForValue(a) || adapterForValue(b)) {
                if (!equalsDateLike(a, b)) return false
                continue
            }
        }

        // Check if both are arrays or neither (for accuracy and performance)
        const isArrayA = Array.isArray(a)
        const isArrayB = Array.isArray(b)
        if (isArrayA !== isArrayB) return false

        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        if (keysA.length !== keysB.length) return false

        for (const key of keysA) {
            if (!Object.prototype.hasOwnProperty.call(b, key)) return false
            stack.push([a[key], b[key]])
        }
    }

    return true
}
