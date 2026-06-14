import { List, Type } from '../decorators'
import { isKnownNonArray, isPrimitiveType } from './utils'
import { FieldRuleFn } from './types'

const listOnNonArray: FieldRuleFn = s =>
    s.appliedSelf.some(d => d.name === List.name) && isKnownNonArray(s.fieldType) ? `@List can only be applied to array fields` : null

const typeOnPrimitive: FieldRuleFn = s =>
    s.appliedSelf.some(d => d.name === Type.name) && isPrimitiveType(s.fieldType) ? `@Type cannot be applied to a primitive field` : null

export const TYPE_HELPER_PLACEMENT_RULES: readonly FieldRuleFn[] = [listOnNonArray, typeOnPrimitive]
