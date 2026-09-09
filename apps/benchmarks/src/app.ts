import 'reflect-metadata'
import express, { NextFunction, Request, RequestHandler, Response, Router } from 'express'
import {
    bindingCargo,
    Body,
    getCargo,
    Header,
    List,
    ListMinSize,
    Max,
    MaxLength,
    Min,
    MinLength,
    OneOf,
    Params,
    Query,
    Regexp,
    setCargoErrorHandler,
    Transform,
    Validate,
} from 'express-cargo'
import { plainToInstance, Transform as ClassTransform, Type as ClassType } from 'class-transformer'
import * as validator from 'class-validator'
import { z } from 'zod'

type ItemInput = {
    sku: string
    quantity: number
    price: number
}

type RequestInput = {
    id: number
    active: boolean
    requestId: string
    name: string
    email: string
    age: number
    role: string
    items: ItemInput[]
}

const INVALID_RESPONSE = { error: 'invalid request' }
const INTERNAL_ERROR_RESPONSE = { error: 'internal server error' }
const EMAIL_PATTERN =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
const MIN_THREE_CODE_UNITS_PATTERN = /^[\s\S]{3,}$/
const THREE_TO_FIFTY_CODE_UNITS_PATTERN = /^[\s\S]{3,50}$/
const MIN_EIGHT_CODE_UNITS_PATTERN = /^[\s\S]{8,}$/
const isFiniteNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value)

class CargoItem implements ItemInput {
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

class CargoRequest implements RequestInput {
    @Params()
    @Min(1)
    @Validate(isFiniteNumber)
    id!: number

    @Query()
    active!: boolean

    @Header('request-id')
    @MinLength(8)
    requestId!: string

    @Body()
    @Transform((value: string) => value.trim())
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

class ClassValidatorItem implements ItemInput {
    @ClassType(() => String)
    @validator.IsString()
    @validator.Matches(MIN_THREE_CODE_UNITS_PATTERN)
    sku!: string

    @ClassType(() => Number)
    @validator.IsNumber({ allowNaN: false, allowInfinity: false })
    @validator.Min(1)
    quantity!: number

    @ClassType(() => Number)
    @validator.IsNumber({ allowNaN: false, allowInfinity: false })
    @validator.Min(0.01)
    price!: number
}

class ClassValidatorRequest implements RequestInput {
    @ClassType(() => Number)
    @validator.IsNumber({ allowNaN: false, allowInfinity: false })
    @validator.Min(1)
    id!: number

    @ClassTransform(({ value }) => (value === undefined ? undefined : value === true || value === 'true'))
    @validator.IsBoolean()
    active!: boolean

    @ClassType(() => String)
    @validator.IsString()
    @validator.Matches(MIN_EIGHT_CODE_UNITS_PATTERN)
    requestId!: string

    @ClassType(() => String)
    @ClassTransform(({ value }) => (value === undefined ? undefined : String(value).trim()))
    @validator.IsString()
    @validator.Matches(THREE_TO_FIFTY_CODE_UNITS_PATTERN)
    name!: string

    @ClassType(() => String)
    @validator.Matches(EMAIL_PATTERN)
    email!: string

    @ClassType(() => Number)
    @validator.IsNumber({ allowNaN: false, allowInfinity: false })
    @validator.Min(18)
    @validator.Max(120)
    age!: number

    @ClassType(() => String)
    @validator.IsIn(['admin', 'user'])
    role!: string

    @ClassType(() => ClassValidatorItem)
    @validator.IsArray()
    @validator.ArrayMinSize(1)
    @validator.ValidateNested({ each: true })
    items!: ClassValidatorItem[]
}

const cargoString = (schema: z.ZodString) => z.preprocess(value => (value === undefined ? undefined : String(value)), schema)
const strictBoolean = z.preprocess(value => (value === undefined ? undefined : value === true || value === 'true'), z.boolean())
const itemSchema = z.object({
    sku: cargoString(z.string().regex(MIN_THREE_CODE_UNITS_PATTERN)),
    quantity: z.coerce.number().min(1),
    price: z.coerce.number().min(0.01),
})
const requestSchema = z.object({
    id: z.coerce.number().min(1),
    active: strictBoolean,
    requestId: z.string().regex(MIN_EIGHT_CODE_UNITS_PATTERN),
    name: cargoString(z.string().trim().regex(THREE_TO_FIFTY_CODE_UNITS_PATTERN)),
    email: cargoString(z.string().regex(EMAIL_PATTERN)),
    age: z.coerce.number().min(18).max(120),
    role: z.enum(['admin', 'user']),
    items: z.array(itemSchema).min(1),
})

function rawInput(req: Request): Record<string, unknown> {
    return {
        ...req.body,
        id: req.params.id,
        active: req.query.active,
        requestId: req.headers['request-id'],
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringInput(value: unknown): boolean {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

function isNumberInput(value: unknown): boolean {
    return typeof value === 'string' || typeof value === 'number'
}

const requireSupportedInputShape: RequestHandler = (req, res, next) => {
    const body: unknown = req.body
    const active: unknown = req.query.active
    const requestId: unknown = req.headers['request-id']

    const validItems =
        isRecord(body) &&
        Array.isArray(body.items) &&
        body.items.every(item => isRecord(item) && isStringInput(item.sku) && isNumberInput(item.quantity) && isNumberInput(item.price))
    const validRequest =
        isRecord(body) &&
        typeof req.params.id === 'string' &&
        (active === 'true' || active === 'false') &&
        typeof requestId === 'string' &&
        isStringInput(body.name) &&
        isStringInput(body.email) &&
        isNumberInput(body.age) &&
        isStringInput(body.role) &&
        validItems

    if (!validRequest) {
        res.status(400).json(INVALID_RESPONSE)
        return
    }

    next()
}

function sendResponse(res: Response, input: RequestInput): void {
    const total = input.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    if (!Number.isFinite(total)) {
        res.status(400).json(INVALID_RESPONSE)
        return
    }

    res.json({
        id: input.id,
        active: input.active,
        requestId: input.requestId,
        name: input.name,
        email: input.email,
        age: input.age,
        role: input.role,
        itemCount: input.items.length,
        total,
    })
}

const parseZod: RequestHandler = (req, res, next) => {
    const result = requestSchema.safeParse(rawInput(req))
    if (!result.success) {
        res.status(400).json(INVALID_RESPONSE)
        return
    }

    res.locals.input = result.data
    next()
}

const parseClassValidator: RequestHandler = (req, res, next) => {
    const input = plainToInstance(ClassValidatorRequest, rawInput(req))
    if (validator.validateSync(input).length > 0) {
        res.status(400).json(INVALID_RESPONSE)
        return
    }

    res.locals.input = input
    next()
}

setCargoErrorHandler((_error, _req, res) => {
    res.status(400).json(INVALID_RESPONSE)
})

const expressCargoRouter: Router = express.Router()
expressCargoRouter.post('/orders/:id', requireSupportedInputShape, bindingCargo(CargoRequest), (req, res) =>
    sendResponse(res, getCargo<CargoRequest>(req)),
)

const zodRouter: Router = express.Router()
zodRouter.post('/orders/:id', requireSupportedInputShape, parseZod, (_req, res) => sendResponse(res, res.locals.input))

const classValidatorRouter: Router = express.Router()
classValidatorRouter.post('/orders/:id', requireSupportedInputShape, parseClassValidator, (_req, res) => sendResponse(res, res.locals.input))

export const app = express()
app.use(express.json())
app.use('/express-cargo', expressCargoRouter)
app.use('/zod', zodRouter)
app.use('/class-validator', classValidatorRouter)
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    void _next
    const errorStatus = 'status' in error ? error.status : undefined
    const status = typeof errorStatus === 'number' && errorStatus >= 400 && errorStatus < 500 ? errorStatus : 500
    res.status(status).json(status < 500 ? INVALID_RESPONSE : INTERNAL_ERROR_RESPONSE)
})
