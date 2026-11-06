import 'reflect-metadata'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import * as validator from 'class-validator'
import {
    EMAIL_PATTERN,
    MIN_EIGHT_CODE_UNITS_PATTERN,
    MIN_THREE_CODE_UNITS_PATTERN,
    THREE_TO_FIFTY_CODE_UNITS_PATTERN,
} from '../../scenarios/patterns'
import type { OrderItemRequest, OrderRequest } from '../../common/types'

// @Type(() => String) would also stringify objects, so only scalars are converted.
const scalarToString = ({ value }: TransformFnParams) =>
    typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : value

class ClassValidatorItem implements OrderItemRequest {
    @Transform(scalarToString)
    @validator.IsString()
    @validator.Matches(MIN_THREE_CODE_UNITS_PATTERN)
    sku!: string

    @Type(() => Number)
    @validator.IsNumber({ allowNaN: false, allowInfinity: false })
    @validator.Min(1)
    quantity!: number

    @Type(() => Number)
    @validator.IsNumber({ allowNaN: false, allowInfinity: false })
    @validator.Min(0.01)
    price!: number
}

export class ClassValidatorRequest implements OrderRequest {
    @Type(() => Number)
    @validator.IsNumber({ allowNaN: false, allowInfinity: false })
    @validator.Min(1)
    id!: number

    @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : value))
    @validator.IsBoolean()
    active!: boolean

    @Type(() => String)
    @validator.IsString()
    @validator.Matches(MIN_EIGHT_CODE_UNITS_PATTERN)
    requestId!: string

    @Transform(params => {
        const text = scalarToString(params)
        return typeof text === 'string' ? text.trim() : text
    })
    @validator.IsString()
    @validator.Matches(THREE_TO_FIFTY_CODE_UNITS_PATTERN)
    name!: string

    @Type(() => String)
    @validator.Matches(EMAIL_PATTERN)
    email!: string

    @Type(() => Number)
    @validator.IsNumber({ allowNaN: false, allowInfinity: false })
    @validator.Min(18)
    @validator.Max(120)
    age!: number

    @Type(() => String)
    @validator.IsIn(['admin', 'user'])
    role!: string

    @Type(() => ClassValidatorItem)
    @validator.IsArray()
    @validator.ArrayMinSize(1)
    @validator.ValidateNested({ each: true })
    items!: ClassValidatorItem[]
}
