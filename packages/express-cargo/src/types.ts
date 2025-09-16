export type Source = 'body' | 'query' | 'params' | 'header' | 'session'

type ValidatorFunction = (value: any) => boolean
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

    validate(value: any): CargoFieldError | null {
        if (!this.validateFunction(value)) {
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
