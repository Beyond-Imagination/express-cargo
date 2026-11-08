// Fields are `declare`d so SWC emits no `_define_property` initializers; the constructors assign them directly.

/**
 * Represents an error for a specific field validation failure.
 */
export class CargoFieldError {
    declare name: string
    declare field: string | symbol
    declare message: string

    constructor(field: string | symbol, message: string) {
        this.name = 'CargoFieldError'
        this.field = field
        this.message = message
    }
}

/**
 * Represents an error when validation fails for a request object.
 * Contains a list of all field errors.
 *
 * No stack trace is captured: the error reports bad client input rather than a code path,
 * and capturing the stack dominated the cost of rejecting a request.
 */
export class CargoValidationError extends Error {
    declare name: string
    declare errors: CargoFieldError[]

    constructor(errors: CargoFieldError[]) {
        const stackTraceLimit = Error.stackTraceLimit
        Error.stackTraceLimit = 0
        try {
            super('Cargo validation failed')
        } finally {
            Error.stackTraceLimit = stackTraceLimit
        }
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
