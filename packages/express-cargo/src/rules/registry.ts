import { makeFieldRuleChecker } from './ruleChecker'
import type { RuleChecker } from './types'
import { KIND_CATEGORY_RULES } from './kindCategory'
import { EACH_USAGE_RULES } from './eachUsage'

/**
 * All field-level rule implementations, keyed by stable rule id.
 */
const FIELD_RULES = {
    ...KIND_CATEGORY_RULES,
    ...EACH_USAGE_RULES,
}

type RuleId = keyof typeof FIELD_RULES

/** Ids of rules currently active. Derived from FIELD_RULES so a missing impl can't slip through. */
const ACTIVE_RULE_IDS: readonly RuleId[] = Object.keys(FIELD_RULES) as RuleId[]

/** Single RuleChecker that runs every active field rule. */
export const ACTIVE_CHECKERS: readonly RuleChecker[] = [makeFieldRuleChecker(ACTIVE_RULE_IDS, FIELD_RULES)]
