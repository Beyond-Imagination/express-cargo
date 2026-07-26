import { Each } from '../decorators'
import { isKnownNonArray } from './utils'
import { FieldRuleFn } from './types'

const eachWrapsSource: FieldRuleFn = s => {
    const offenders = s.appliedEach.filter(t => t.category === 'source')
    return offenders.length === 0 ? null : `@Each cannot wrap source decorator(s): ${offenders.map(t => `@${t.name}`).join(', ')}`
}

const eachWrapsMissingHandler: FieldRuleFn = s => {
    const offenders = s.appliedEach.filter(t => t.category === 'missing-handler')
    return offenders.length === 0 ? null : `@Each cannot wrap missing-handler decorator(s): ${offenders.map(t => `@${t.name}`).join(', ')}`
}

const eachWrapsTransform: FieldRuleFn = s => {
    const offenders = s.appliedEach.filter(t => t.category === 'transform')
    return offenders.length === 0 ? null : `@Each cannot wrap transform decorator(s): ${offenders.map(t => `@${t.name}`).join(', ')}`
}

const eachWrapsTypeHelper: FieldRuleFn = s => {
    const offenders = s.appliedEach.filter(t => t.category === 'type-helper')
    return offenders.length === 0 ? null : `@Each cannot wrap type-helper decorator(s): ${offenders.map(t => `@${t.name}`).join(', ')}`
}

const eachOnNonArray: FieldRuleFn = s =>
    s.appliedSelf.some(d => d.name === Each.name) && isKnownNonArray(s.fieldType) ? `@Each can only be applied to array fields` : null

export const EACH_USAGE_RULES: readonly FieldRuleFn[] = [
    eachWrapsSource,
    eachWrapsMissingHandler,
    eachWrapsTransform,
    eachWrapsTypeHelper,
    eachOnNonArray,
]
