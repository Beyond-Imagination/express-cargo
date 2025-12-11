export type Source = 'body' | 'query' | 'params' | 'header' | 'session'

type ClassConstructor = new () => any
export type validArrayElementType = typeof String | typeof Number | typeof Boolean | typeof Date | ClassConstructor
export type ArrayElementType = validArrayElementType | 'string' | 'number' | 'boolean' | 'date'
export type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'all'

type ValidatorFunction = (value: any, instance?: Record<string | symbol, any>) => boolean
type errorMessageFunction = (property: string | symbol, value: any) => string
export type cargoErrorMessage = string | errorMessageFunction

export class ValidatorRule {
    type: string
    propertyKey: string | symbol
    validateFunction: ValidatorFunction
    message: cargoErrorMessage

    constructor(propertyKey: string | symbol, type: string, validate: ValidatorFunction, message: cargoErrorMessage) {
        this.propertyKey = propertyKey
        this.type = type
        this.validateFunction = validate
        this.message = message
    }

    validate(value: any, instance?: Record<string | symbol, any>): CargoFieldError | null {
        if (!this.validateFunction(value, instance)) {
            let message = typeof this.message === 'string' ? this.message : this.message(this.propertyKey, value)
            return new CargoFieldError(this.propertyKey, message)
        }

        return null
    }
}

export class CargoFieldError extends Error {
    name: string
    field: string | symbol

    constructor(field: string | symbol, message: string) {
        super(message)
        this.name = 'CargoFieldError'
        this.field = field
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
    constructor(field: string | symbol, message: string) {
        super(field, message)
        this.name = 'CargoTransformFieldError'
    }
}

export type TypedPropertyDecorator<T> = <K extends string | symbol>(target: { [P in K]?: T }, propertyKey: K) => void
