import type { ClassConstructor } from '../types'
import type { RuleViolation } from './types'

/** Thrown by `validateCargoSchema()` when one or more rule violations are detected. */
export class CargoSchemaError extends Error {
    name: string
    violations: RuleViolation[]

    constructor(cargoClass: ClassConstructor, violations: RuleViolation[]) {
        const header = `Cargo schema validation failed for ${cargoClass.name}: ${violations.length} violation(s)`
        const detail = violations.map(v => `  [${v.ruleId}] ${v.cargoClass.name}.${String(v.field)}: ${v.message}`).join('\n')
        super(`${header}\n${detail}`)
        this.name = 'CargoSchemaError'
        this.violations = violations
    }
}
