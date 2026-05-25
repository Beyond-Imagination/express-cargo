import { CargoSchemaError } from '../../src'
import type { RuleViolation } from '../../src/rules/types'

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
