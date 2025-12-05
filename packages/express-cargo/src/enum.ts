import { CargoClassMetadata } from './metadata'
import { cargoErrorMessage, TypedPropertyDecorator, ValidatorRule } from './types'

export function Enum<T>(enumObj: any, message?: cargoErrorMessage): TypedPropertyDecorator<T> {
    return (target: Object, propertyKey: string | symbol): void => {
        const classMeta = new CargoClassMetadata(target)
        const fieldMeta = classMeta.getFieldMetadata(propertyKey)

        const enumValues = Object.keys(enumObj)
            .filter(k => isNaN(Number(k)))
            .map(k => enumObj[k as keyof typeof enumObj])

        // 1. enum 타입 정보 저장
        fieldMeta.setEnumType(enumObj)

        // 2. enum validator 추가
        fieldMeta.addValidator(
            new ValidatorRule(
                propertyKey,
                'enum',
                input => enumValues.some(v => String(v) === String(input)),
                message || `${String(propertyKey)} must be one of: ${enumValues.join(', ')}`,
            ),
        )

        // 3. enum transformer 추가
        const transformer = (value: any): any => {
            if (value === null || value === undefined) return value

            // enumObj 예: { 0: "ADMIN", 1: "USER", ADMIN: 0, USER: 1 }
            const enumEntries = Object.entries(enumObj)

            // 숫자 문자열 → 숫자
            if (typeof value === 'string' && !isNaN(Number(value))) {
                value = Number(value)
            }

            // ① value가 enum의 value(숫자 또는 문자열)로 직접 존재하는지 체크
            const directMatch = enumEntries.find(([k, v]) => v === value)
            if (directMatch) {
                const [key] = directMatch
                return enumObj[key as keyof typeof enumObj]
            }

            // ② value가 enum key로 들어온 경우
            if (typeof value === 'string' && value in enumObj) {
                return enumObj[value as keyof typeof enumObj]
            }

            // ③ 숫자 enum인 경우: 숫자로 들어왔을 때 enum value 매핑
            if (typeof value === 'number' && value in enumObj) {
                // ex) enumObj[0] === 'ADMIN', 그러면 enumObj['ADMIN'] → 0 반환
                const enumKey = enumObj[value]
                if (enumKey && enumKey in enumObj) {
                    return enumObj[enumKey as keyof typeof enumObj]
                }
            }

            return value
        }
        fieldMeta.setTransformer(transformer)

        // 메타데이터 저장
        classMeta.setFieldMetadata(propertyKey, fieldMeta)
    }
}
