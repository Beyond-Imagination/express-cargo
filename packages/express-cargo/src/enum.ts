import { CargoClassMetadata } from './metadata'
import { cargoErrorMessage, TypedPropertyDecorator, ValidatorRule } from './types'

export function enumType<T>(enumObj: object, message?: cargoErrorMessage): TypedPropertyDecorator<T> {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        const enumValues = Object.values(enumObj)

        // 1. enum 타입 정보 저장
        fieldMeta.setEnumType(enumObj)

        // 2. enum validator 추가
        fieldMeta.addValidator(
            new ValidatorRule(
                propertyKey,
                'enumType',
                input => enumValues.includes(input),
                message || `${String(propertyKey)} must be one of: ${enumValues.join(', ')}`,
            ),
        )

        // 메타데이터 저장
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}
