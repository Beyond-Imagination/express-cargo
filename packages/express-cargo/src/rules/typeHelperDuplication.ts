import { FieldRuleFn } from './types'

const multipleTypeHelpers: FieldRuleFn = s => {
    const helpers = s.appliedSelf.filter(d => d.category === 'type-helper')
    return helpers.length > 1 ? `${helpers.map(d => `@${d.name}`).join(' + ')} cannot be combined; apply a single one of @Type/@List/@Enum` : null
}

/** Type-helper duplication rules (`@Type` / `@List` / `@Enum`). */
export const TYPE_HELPER_DUPLICATION_RULES: readonly FieldRuleFn[] = [multipleTypeHelpers]
