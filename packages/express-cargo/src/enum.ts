import { CargoClassMetadata } from './metadata'
import { cargoErrorMessage, TypedPropertyDecorator, ValidatorRule } from './types'

export function Enum<T>(enumObj: any, message?: cargoErrorMessage): TypedPropertyDecorator<T> {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        const enumKeys = Object.keys(enumObj).filter(k => isNaN(Number(k)))
        const enumValues = enumKeys.map(k => enumObj[k as keyof typeof enumObj])
        const validInputs = [...enumKeys, ...enumValues]

        // 1. enum 타입 정보 저장
        fieldMeta.setEnumType(enumObj)

        // 2. enum validator 추가
        fieldMeta.addValidator(
            new ValidatorRule(
                propertyKey,
                'enum',
                input => validInputs.some(v => String(v) === String(input)),
                message || `${String(propertyKey)} must be one of: ${enumValues.join(', ')}`,
            ),
        )

        // 3. enum transformer 추가
        const transformer = (value: any): any => {
            if (value === null || value === undefined) return value

            const enumKeys = Object.keys(enumObj).filter(k => isNaN(Number(k)))

            // 1. 입력값이 enum 키('ADMIN') 인 경우
            if (typeof value === 'string' && enumKeys.includes(value)) {
                return enumObj[value as keyof typeof enumObj]
            }

            // 비교를 위해 숫자형 문자열을 숫자로 변환
            const comparableValue = typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value

            // 2. 입력값이 enum 값(예: 0 또는 'admin')인 경우
            for (const key of enumKeys) {
                if (enumObj[key as keyof typeof enumObj] === comparableValue) {
                    return comparableValue
                }
            }

            return value
        }
        fieldMeta.setTransformer(transformer)

        // 메타데이터 저장
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}
