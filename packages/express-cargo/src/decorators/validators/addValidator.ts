import { AppliedDecorator, ValidatorRule } from '../../types'
import { CargoClassMetadata } from '../../metadata'

/**
 * Registers a validator rule on a field, optionally recording the applied decorator tag.
 * @internal
 */
export function addValidator(target: any, propertyKey: string | symbol, rule: ValidatorRule, applied?: AppliedDecorator) {
    const classMeta = new CargoClassMetadata(target)
    const fieldMeta = classMeta.getFieldMetadata(propertyKey)
    fieldMeta.addValidator(rule)
    if (applied) fieldMeta.pushAppliedDecorator(applied)
    classMeta.setFieldMetadata(propertyKey, fieldMeta)
}
