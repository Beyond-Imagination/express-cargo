import type { CargoFieldMetadata } from '../metadata'
import type { FieldRuleFn, FieldState, RuleChecker, RuleContext, RuleViolation } from './types'

/**
 * Contract for a single rule checker.
 *
 * Inspects one class (`ctx.cargoClass`) and returns every violation it finds.
 * Nested-DTO traversal is handled by `validateCargoSchema`, so checkers don't recurse.
 */

function violation(ctx: RuleContext, ruleId: string, field: string | symbol, message: string): RuleViolation {
    return { ruleId, cargoClass: ctx.cargoClass, field, message }
}

function buildFieldState(propertyKey: string | symbol, fieldMeta: CargoFieldMetadata): FieldState {
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
    }
}

/**
 * Turns a registry of field rules + a priority-ordered ID list into a {@link RuleChecker}.
 * Reordering / disabling / replacing rules is done at the registry and ID-list level —
 * the checker itself never needs to change.
 */
export function makeFieldRuleChecker(ids: readonly string[], registry: Readonly<Record<string, FieldRuleFn>>): RuleChecker {
    return ctx => {
        const violations: RuleViolation[] = []
        for (const propertyKey of ctx.classMeta.getAllFieldsList()) {
            const fieldMeta = ctx.classMeta.getFieldMetadata(propertyKey)
            const state = buildFieldState(propertyKey, fieldMeta)
            for (const id of ids) {
                const rule = registry[id]
                if (!rule) continue
                const message = rule(state)
                if (message !== null) {
                    violations.push(violation(ctx, id, propertyKey, message))
                }
            }
        }
        return violations
    }
}
