import { List, Type } from '../decorators'
import { isTemporalSupported, temporalAliasName, TEMPORAL_MIN_NODE_MAJOR, temporalTypeName } from '../dateLike'
import { isClass } from '../utils'
import { TypeOptions } from '../types'
import { FieldRuleFn, FieldState } from './types'

/** Every type a field declares statically: its property type, `@List` element and `@Type` targets. */
function declaredTypes(s: FieldState): unknown[] {
    const types: unknown[] = [s.fieldType]
    for (const decorator of s.appliedSelf) {
        if (decorator.name === List.name) {
            types.push(decorator.args?.[0])
        } else if (decorator.name === Type.name) {
            const [typeFn, options] = (decorator.args ?? []) as [unknown, TypeOptions | undefined]
            if (isClass(typeFn)) {
                types.push(typeFn)
            } else if (typeof typeFn === 'function' && typeFn.length === 0) {
                // Same thunk handling as schema analysis: a thunk that needs runtime data is checked at binding instead.
                try {
                    types.push(typeFn())
                } catch {
                    // ignored
                }
            }
            for (const sub of options?.discriminator?.subTypes ?? []) types.push(sub.value)
        }
    }
    return types
}

const temporalNeedsSupportedRuntime: FieldRuleFn = s => {
    if (isTemporalSupported()) return null
    for (const type of declaredTypes(s)) {
        const name = typeof type === 'string' ? temporalAliasName(type) : temporalTypeName(type)
        if (name !== undefined) {
            return `Temporal.${name} fields require Node.js ${TEMPORAL_MIN_NODE_MAJOR} or later with built-in Temporal`
        }
    }
    return null
}

export const TEMPORAL_SUPPORT_RULES: readonly FieldRuleFn[] = [temporalNeedsSupportedRuntime]
