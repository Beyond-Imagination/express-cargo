import { Enum } from '../decorators'
import { FieldRuleFn } from './types'

const enumWithTransform: FieldRuleFn = s => {
    const hasEnum = s.appliedSelf.some(d => d.name === Enum.name)
    const hasTransform = s.appliedSelf.some(d => d.category === 'transform')
    return hasEnum && hasTransform ? `@${Enum.name} cannot be combined with @Transform; @${Enum.name} installs its own transformer` : null
}

const fileWithTransform: FieldRuleFn = s => {
    const isFile = s.sources.some(d => d.name === 'file' || d.name === 'files')
    const hasTransform = s.appliedSelf.some(d => d.category === 'transform')
    return isFile && hasTransform ? `@Transform cannot be applied to an uploaded file field; files are bound as-is from the parser` : null
}

/** Transformer-priority rules — decorators whose semantics preclude a user `@Transform` reject it. */
export const TRANSFORMER_PRIORITY_RULES: readonly FieldRuleFn[] = [enumWithTransform, fileWithTransform]
