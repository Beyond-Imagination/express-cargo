export type Source = 'body' | 'query' | 'uri' | 'header' | 'session' | 'field'

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
