import { FieldRuleFn } from './types'

const eachWrapsSource: FieldRuleFn = s => {
    const offenders = s.appliedEach.filter(t => t.category === 'source')
    return offenders.length === 0 ? null : `@Each cannot wrap source decorator(s): ${offenders.map(t => `@${t.name}`).join(', ')}`
}

const eachWrapsMissingHandler: FieldRuleFn = s => {
    const offenders = s.appliedEach.filter(t => t.category === 'missing-handler')
    return offenders.length === 0 ? null : `@Each cannot wrap missing-handler decorator(s): ${offenders.map(t => `@${t.name}`).join(', ')}`
}

/** Misuse of `@Each(...)` arguments. */
export const EACH_USAGE_RULES: readonly FieldRuleFn[] = [eachWrapsSource, eachWrapsMissingHandler]
