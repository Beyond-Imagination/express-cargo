import { Enum } from '../enum'
import { FieldRuleFn } from './types'

const enumWithTransform: FieldRuleFn = s => {
    const hasEnum = s.appliedSelf.some(d => d.name === Enum.name)
    const hasTransform = s.appliedSelf.some(d => d.category === 'transform')
    return hasEnum && hasTransform ? `@${Enum.name} cannot be combined with @Transform; @${Enum.name} installs its own transformer` : null
}

/** Transformer-priority rules — decorators that own their transform reject an extra `@Transform`. */
export const TRANSFORMER_PRIORITY_RULES: readonly FieldRuleFn[] = [enumWithTransform]
