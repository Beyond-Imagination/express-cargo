import 'reflect-metadata'
import { Body, Header, List, ListMinSize, Max, MaxLength, Min, MinLength, OneOf, Params, Query, Regexp, Transform, Validate } from 'express-cargo'
import { EMAIL_PATTERN } from '../../scenarios/patterns'
import type { OrderItemRequest, OrderRequest } from '../../common/types'

const isFiniteNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value)
const isString = (value: unknown) => typeof value === 'string'
// Keeps `benchmark:version` usable against refs that let arrays through boolean fields.
const isBoolean = (value: unknown) => typeof value === 'boolean'

class CargoItem implements OrderItemRequest {
    @Body()
    @MinLength(3)
    sku!: string

    @Body()
    @Min(1)
    @Validate(isFiniteNumber)
    quantity!: number

    @Body()
    @Min(0.01)
    @Validate(isFiniteNumber)
    price!: number
}

export class CargoRequest implements OrderRequest {
    @Params()
    @Min(1)
    @Validate(isFiniteNumber)
    id!: number

    @Query()
    @Validate(isBoolean)
    active!: boolean

    @Header('request-id')
    @MinLength(8)
    requestId!: string

    @Body()
    @Transform((value: unknown) => (typeof value === 'string' ? value.trim() : value))
    @Validate(isString)
    @MinLength(3)
    @MaxLength(50)
    name!: string

    @Body()
    @Regexp(EMAIL_PATTERN)
    email!: string

    @Body()
    @Min(18)
    @Max(120)
    @Validate(isFiniteNumber)
    age!: number

    @Body()
    @OneOf(['admin', 'user'] as const)
    role!: string

    @Body()
    @List(CargoItem)
    @ListMinSize(1)
    @Validate(value => Array.isArray(value) && value.every(item => item instanceof CargoItem))
    items!: CargoItem[]
}
