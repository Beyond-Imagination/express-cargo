import { CargoSchemaError } from '../../src'
import type { RuleViolation } from '../../src/rules/types'

/**
 * Invokes `fn` and asserts that it throws a `CargoSchemaError` whose `violations`
 * include an entry with the given `ruleId` on the given `field`. Returns the
 * matched violation so additional assertions can be layered on top.
 */
export function expectViolation(fn: () => unknown, ruleId: string, field: string): RuleViolation {
    try {
        fn()
    } catch (e) {
        if (!(e instanceof CargoSchemaError)) throw e
        const matched = e.violations.find(v => v.ruleId === ruleId && v.field === field)
        if (!matched) {
            throw new Error(`expected violation ${ruleId} on '${field}', got: ${JSON.stringify(e.violations)}`)
        }
        return matched
    }
    throw new Error('expected CargoSchemaError to be thrown')
}
