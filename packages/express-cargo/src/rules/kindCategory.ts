import { FieldRuleFn } from './types'

const multipleSources: FieldRuleFn = s =>
    s.sources.length > 1 ? `${s.sources.map(d => `@${d.name}`).join(' + ')} cannot be combined; pick a single source` : null

const sourceWithRequest: FieldRuleFn = s => (s.hasSource && s.hasRequest ? `@${s.sources[0].name} cannot be combined with @Request` : null)

const sourceWithVirtual: FieldRuleFn = s => (s.hasSource && s.hasVirtual ? `@${s.sources[0].name} cannot be combined with @Virtual` : null)

const requestWithVirtual: FieldRuleFn = s => (s.hasRequest && s.hasVirtual ? `@Request cannot be combined with @Virtual` : null)

const missingKindDecorator: FieldRuleFn = s =>
    !s.hasSource && !s.hasRequest && !s.hasVirtual
        ? `field must be decorated with one of @Body/@Query/@Params/@Header/@Session/@Request/@Virtual`
        : null

/** Kind-category conflict rules (`Source` / `Request` / `Virtual`). */
export const KIND_CATEGORY_RULES: readonly FieldRuleFn[] = [
    multipleSources,
    sourceWithRequest,
    sourceWithVirtual,
    requestWithVirtual,
    missingKindDecorator,
]
