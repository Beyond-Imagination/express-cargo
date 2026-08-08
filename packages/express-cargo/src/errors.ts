/**
 * Represents an error for a specific field validation failure.
 */
export class CargoFieldError extends Error {
    name: string
    field: string | symbol

    constructor(field: string | symbol, message: string) {
        super(message)
        this.name = 'CargoFieldError'
        this.field = field
    }
}

/**
 * Represents an error when validation fails for a request object.
 * Contains a list of all field errors.
 */
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
