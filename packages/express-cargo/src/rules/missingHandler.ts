import { FieldRuleFn } from './types'

const optionalWithDefault: FieldRuleFn = s => {
    const handlerNames = new Set(s.appliedSelf.filter(d => d.category === 'missing-handler').map(d => d.name))
    return handlerNames.size > 1
        ? `${[...handlerNames].map(n => `@${n}`).join(' + ')} cannot be combined; pick a single missing-value strategy`
        : null
}

/** Missing-handler duplication rules (`@Optional` / `@Default`). */
export const MISSING_HANDLER_RULES: readonly FieldRuleFn[] = [optionalWithDefault]
