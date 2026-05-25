import { makeFieldRuleChecker } from './ruleChecker'
import type { FieldRuleFn, RuleChecker } from './types'
import { KIND_CATEGORY_RULES } from './kindCategory'
import { EACH_USAGE_RULES } from './eachUsage'

/** All field-level rule implementations currently active. */
const FIELD_RULES: readonly FieldRuleFn[] = [...KIND_CATEGORY_RULES, ...EACH_USAGE_RULES]

/** Single RuleChecker that runs every active field rule. */
export const ACTIVE_CHECKERS: readonly RuleChecker[] = [makeFieldRuleChecker(FIELD_RULES)]
