import { FieldRuleFn } from './types'

const optionalWithDefault: FieldRuleFn = s => {
    const handlers = s.appliedSelf.filter(d => d.category === 'missing-handler')
    return handlers.length > 1 ? `${handlers.map(d => `@${d.name}`).join(' + ')} cannot be combined; pick a single missing-value strategy` : null
}

/** Missing-handler duplication rules (`@Optional` / `@Default`). */
export const MISSING_HANDLER_RULES: readonly FieldRuleFn[] = [optionalWithDefault]
