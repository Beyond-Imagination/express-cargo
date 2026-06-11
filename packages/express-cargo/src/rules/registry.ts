import { makeFieldRuleChecker } from './ruleChecker'
import type { FieldRuleFn, RuleChecker } from './types'
import { BASIC_RULES } from './basic'
import { KIND_CATEGORY_RULES } from './kindCategory'
import { EACH_USAGE_RULES } from './eachUsage'
import { TYPE_HELPER_PLACEMENT_RULES } from './typeHelperPlacement'
import { CROSS_FIELD_RULES } from './crossField'

/** All field-level rule implementations currently active. */
const FIELD_RULES: readonly FieldRuleFn[] = [
    ...BASIC_RULES,
    ...KIND_CATEGORY_RULES,
    ...EACH_USAGE_RULES,
    ...TYPE_HELPER_PLACEMENT_RULES,
    ...CROSS_FIELD_RULES,
]

/** Single RuleChecker that runs every active field rule. */
export const ACTIVE_CHECKERS: readonly RuleChecker[] = [makeFieldRuleChecker(FIELD_RULES)]
