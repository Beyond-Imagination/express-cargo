import { AnalysisResult, ClassConstructor } from '../types'
import { ACTIVE_CHECKERS } from './registry'
import { CargoSchemaError } from './errors'
import { RuleContext, RuleViolation } from './types'

const VALIDATED = new WeakSet<ClassConstructor>()

/**
 * Validates an analysis result (and every nested DTO within it)
 * against the rule checkers registered in {@link ACTIVE_CHECKERS}.
 *
 * Throws {@link CargoSchemaError} aggregating every violation found.
 */
export function validateAnalysis(result: AnalysisResult): void {
    if (VALIDATED.has(result.rootClass)) return

    const violations: RuleViolation[] = []
    const visitedInThisRound: ClassConstructor[] = []

    for (const [cls, classMeta] of result.metadataMap) {
        if (VALIDATED.has(cls)) continue
        visitedInThisRound.push(cls)

        const ctx: RuleContext = { cargoClass: cls, classMeta }
        for (const checker of ACTIVE_CHECKERS) {
            violations.push(...checker(ctx))
        }
    }

    if (violations.length > 0) {
        throw new CargoSchemaError(result.rootClass, violations)
    }

    for (const cls of visitedInThisRound) {
        VALIDATED.add(cls)
    }
}
