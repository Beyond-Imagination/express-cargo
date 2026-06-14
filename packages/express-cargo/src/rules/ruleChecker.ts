import type { CargoFieldMetadata } from '../metadata'
import type { FieldRuleFn, FieldState, RuleChecker, RuleViolation } from './types'

/**
 * Contract for a single rule checker.
 *
 * Inspects one class (`ctx.cargoClass`) and returns every violation it finds.
 * Nested-DTO traversal is handled by `validateCargoSchema`, so checkers don't recurse.
 */
function buildFieldState(propertyKey: string | symbol, fieldMeta: CargoFieldMetadata, siblingFields: ReadonlySet<string | symbol>): FieldState {
    const appliedSelf = fieldMeta.getAppliedDecorators('self')
    const appliedEach = fieldMeta.getAppliedDecorators('each')
    const sources = appliedSelf.filter(d => d.category === 'source')
    return {
        propertyKey,
        fieldType: fieldMeta.type,
        appliedSelf,
        appliedEach,
        sources,
        hasSource: sources.length > 0,
        hasRequest: appliedSelf.some(d => d.category === 'request'),
        hasVirtual: appliedSelf.some(d => d.category === 'virtual'),
        sourceKey: fieldMeta.getKey(),
        siblingFields,
    }
}

/**
 * Turns a list of field rules into a {@link RuleChecker}.
 * Each rule is invoked per field in the given order; the rule's identity is
 * implied by the message it returns, so callers identify violations by message
 * (or by the failing field), not by an opaque id.
 */
export function makeFieldRuleChecker(rules: readonly FieldRuleFn[]): RuleChecker {
    return ctx => {
        const violations: RuleViolation[] = []
        const fields = ctx.classMeta.getAllFieldsList()
        const siblingFields = new Set(fields)
        for (const propertyKey of fields) {
            const fieldMeta = ctx.classMeta.getFieldMetadata(propertyKey)
            const state = buildFieldState(propertyKey, fieldMeta, siblingFields)
            for (const rule of rules) {
                const message = rule(state)
                if (message !== null) {
                    violations.push({ cargoClass: ctx.cargoClass, field: propertyKey, message })
                }
            }
        }
        return violations
    }
}
