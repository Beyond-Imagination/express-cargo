import type { CargoClassMetadata } from '../metadata'
import type { AppliedDecorator, ClassConstructor, Source } from '../types'

/** Inputs supplied to every rule checker. */
export interface RuleContext {
    cargoClass: ClassConstructor
    classMeta: CargoClassMetadata
}

/** Pre-computed per-field view passed to every {@link FieldRuleFn}. */
export interface FieldState {
    propertyKey: string | symbol
    fieldType: unknown
    appliedSelf: readonly AppliedDecorator[]
    appliedEach: readonly AppliedDecorator[]
    sources: readonly AppliedDecorator[]
    /** Internal source key the field binds from, independent of the decorator's authored name. */
    source: Source
    hasSource: boolean
    hasRequest: boolean
    hasVirtual: boolean
    sourceKey: string | symbol
    siblingFields: ReadonlySet<string | symbol>
}

/** A single field-level rule. Returns a violation message, or `null` if the field passes. */
export type FieldRuleFn = (state: FieldState) => string | null

/** A single rule violation produced by the schema validator. */
export interface RuleViolation {
    cargoClass: ClassConstructor
    field: string | symbol
    message: string
}

/**
 * Contract for a single rule checker: inspects one class (`ctx.cargoClass`) and returns
 * every violation it finds. Nested-DTO traversal is handled by `validateAnalysis`, so
 * checkers don't recurse.
 */
export type RuleChecker = (ctx: RuleContext) => RuleViolation[]
