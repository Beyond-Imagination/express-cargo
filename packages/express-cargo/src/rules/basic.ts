import { FieldRuleFn } from './types'

const symbolWithoutDescription: FieldRuleFn = s =>
    typeof s.propertyKey === 'symbol' && !s.propertyKey.description ? `symbol property must have a description` : null

const emptySourceKey: FieldRuleFn = s => (s.hasSource && s.sourceKey === '' ? `@${s.sources[0].name} key must not be an empty string` : null)

export const BASIC_RULES: readonly FieldRuleFn[] = [symbolWithoutDescription, emptySourceKey]
