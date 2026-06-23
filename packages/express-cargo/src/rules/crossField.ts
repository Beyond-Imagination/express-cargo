import { With, Without } from '../validator'
import { FieldRuleFn, FieldState } from './types'

function unknownReference(state: FieldState, decoratorName: string): string | null {
    for (const applied of state.appliedSelf) {
        if (applied.name !== decoratorName) continue
        const target = applied.args[0]
        if (typeof target === 'string' && !state.siblingFields.has(target)) {
            return target
        }
    }
    return null
}

function referencesSelf(state: FieldState, decoratorName: string): string | null {
    for (const applied of state.appliedSelf) {
        if (applied.name !== decoratorName) continue
        if (applied.args[0] === state.propertyKey) return String(state.propertyKey)
    }
    return null
}

const withReferencesUnknownField: FieldRuleFn = s => {
    const target = unknownReference(s, With.name)
    return target === null ? null : `@With references unknown field "${target}"`
}

const withoutReferencesUnknownField: FieldRuleFn = s => {
    const target = unknownReference(s, Without.name)
    return target === null ? null : `@Without references unknown field "${target}"`
}

const withReferencesSelf: FieldRuleFn = s => {
    const target = referencesSelf(s, With.name)
    return target === null ? null : `@With cannot reference its own field "${String(s.propertyKey)}"`
}

const withoutReferencesSelf: FieldRuleFn = s => {
    const target = referencesSelf(s, Without.name)
    return target === null ? null : `@Without cannot reference its own field "${String(s.propertyKey)}"`
}

export const CROSS_FIELD_RULES: readonly FieldRuleFn[] = [
    withReferencesUnknownField,
    withoutReferencesUnknownField,
    withReferencesSelf,
    withoutReferencesSelf,
]
