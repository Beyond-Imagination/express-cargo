import { CargoSchemaError } from '../../src'
import { analyzeCargoSchema } from '../../src/analysis'
import { validateAnalysis } from '../../src/rules/validate'
import { ClassConstructor } from '../../src/types'
import type { RuleViolation } from '../../src/rules/types'

/**
 * Test utility to analyze and validate a DTO class in one step.
 */
export function validateCargoSchema(cargoClass: ClassConstructor): void {
    const result = analyzeCargoSchema(cargoClass)
    validateAnalysis(result)
}

/**
 * Invokes `fn` and asserts that it throws a `CargoSchemaError` whose `violations`
 * include an entry on the given `field` whose `message` contains `messagePart`.
 * Returns the matched violation so additional assertions can be layered on top.
 */
export function expectViolation(fn: () => unknown, field: string, messagePart: string): RuleViolation {
    try {
        fn()
    } catch (e) {
        if (!(e instanceof CargoSchemaError)) throw e
        const matched = e.violations.find(v => v.field === field && v.message.includes(messagePart))
        if (!matched) {
            throw new Error(`expected violation on '${field}' matching "${messagePart}", got: ${JSON.stringify(e.violations)}`)
        }
        return matched
    }
    throw new Error('expected CargoSchemaError to be thrown')
}
