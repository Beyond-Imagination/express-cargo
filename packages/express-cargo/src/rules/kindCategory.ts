import { FieldRuleFn } from './types'

const B1: FieldRuleFn = s =>
    s.sources.length > 1 ? `${s.sources.map(d => `@${d.name}`).join(' + ')} cannot be combined; pick a single source` : null

const B2: FieldRuleFn = s => (s.hasSource && s.hasRequest ? `@${s.sources[0].name} cannot be combined with @Request` : null)

const B3: FieldRuleFn = s => (s.hasSource && s.hasVirtual ? `@${s.sources[0].name} cannot be combined with @Virtual` : null)

const B4: FieldRuleFn = s => (s.hasRequest && s.hasVirtual ? `@Request cannot be combined with @Virtual` : null)

const B5: FieldRuleFn = s =>
    !s.hasSource && !s.hasRequest && !s.hasVirtual
        ? `field must be decorated with one of @Body/@Query/@Params/@Header/@Session/@Request/@Virtual`
        : null

/** Kind-category conflict rules (`Source` / `Request` / `Virtual`). */
export const KIND_CATEGORY_RULES = { B1, B2, B3, B4, B5 } as const
