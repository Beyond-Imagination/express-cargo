import type { CargoClassMetadata } from '../metadata'
import type { AppliedDecorator, ClassConstructor } from '../types'

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
    hasSource: boolean
    hasRequest: boolean
    hasVirtual: boolean
}

/** A single field-level rule. Returns a violation message, or `null` if the field passes. */
export type FieldRuleFn = (state: FieldState) => string | null

/** A single rule violation produced by the schema validator. */
export interface RuleViolation {
    ruleId: string
    cargoClass: ClassConstructor
    field: string | symbol
    message: string
}

export type RuleChecker = (ctx: RuleContext) => RuleViolation[]
