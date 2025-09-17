export type Source = 'body' | 'query' | 'params' | 'header' | 'session'

type ClassConstructor = new () => any
export type validArrayElementType = typeof String | typeof Number | typeof Boolean | typeof Date | ClassConstructor
export type ArrayElementType = validArrayElementType | 'string' | 'number' | 'boolean' | 'date'

type ValidatorFunction = (value: any) => boolean
export type ValidatorRule = {
    type: string
    validate: ValidatorFunction
    message: string
}

export class CargoFieldError extends Error {
    name: string

    constructor(property: string | symbol, reason: string) {
        super(`${String(property)}: ${reason}`)
        this.name = 'CargoFieldError'
    }
}

export class CargoValidationError extends Error {
    name: string
    errors: CargoFieldError[]

    constructor(errors: CargoFieldError[]) {
        super('Cargo validation failed')
        this.name = 'CargoValidationError'
        this.errors = errors
    }
}

export class CargoTransformFieldError extends CargoFieldError {
    name: string

    constructor(property: string | symbol, reason: string) {
        super(property, reason)
        this.name = 'CargoTransformFieldError'
    }
}
