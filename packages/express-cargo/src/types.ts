/**
 * Represents the source of the request data.
 * - `body`: req.body
 * - `query`: req.query
 * - `params`: req.params
 * - `header`: req.headers
 * - `session`: req.session
 */
export type Source = 'body' | 'query' | 'params' | 'header' | 'session'

/**
 * Represents a class constructor.
 */
export type ClassConstructor<T = any> = new (...args: any[]) => T

export type validArrayElementType = typeof String | typeof Number | typeof Boolean | typeof Date | ClassConstructor
export type ArrayElementType = validArrayElementType | 'string' | 'number' | 'boolean' | 'date'
export type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'all'

/**
 * Options for the `@IsUrl` decorator.
 */
export interface IsUrlOptions {
    /**
     * Allowed protocols. Defaults to `['http', 'https']`.
     */
    protocols?: string[]
}

/**
 * A function that returns a class constructor without any arguments.
 * Used for lazy evaluation of types to handle circular dependencies.
 */
export type TypeThunk = () => ClassConstructor

/**
 * A function that returns a class constructor based on the provided data.
 * Used for polymorphic type resolution.
 */
export type TypeResolver = (data: any) => ClassConstructor

/**
 * Configuration for structural polymorphism using a discriminator field.
 * This allows mapping different classes based on the value of a specific property.
 */
export interface DiscriminatorOptions {
    /**
     * The name of the property to check for the type discriminator.
     * e.g., 'type', 'kind'
     */
    property: string
    /**
     * A list of mappings between discriminator values and their corresponding classes.
     */
    subTypes: {
        /** The class constructor to use when the discriminator matches. */
        value: ClassConstructor
        /** The value of the discriminator property that triggers this class. */
        name: string
    }[]
}

/**
 * Options for the `@Type` decorator.
 */
export interface TypeOptions {
    /**
     * Configuration for handling polymorphism via a discriminator field.
     */
    discriminator?: DiscriminatorOptions
}

/**
 * Custom comparator function for array element comparison.
 * @param expected - The value that is expected to be present in the array.
 * @param actual - The value from the actual array being validated.
 * @returns true if the two values are considered equal, false otherwise.
 */
export type ArrayComparator = (expected: any, actual: any) => boolean

type ValidatorFunction = (value: any, instance?: Record<string | symbol, any>) => boolean
type errorMessageFunction = (property: string | symbol, value: any) => string
export type cargoErrorMessage = string | errorMessageFunction

/**
 * Represents a validation rule for a property.
 */
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

    /**
     * Validates a value against this rule.
     * @param value - The value to validate.
     * @param instance - The instance of the object being validated (optional).
     * @returns A CargoFieldError if validation fails, null otherwise.
     */
    validate(value: any, instance?: Record<string | symbol, any>): CargoFieldError | null {
        if (!this.validateFunction(value, instance)) {
            const message = typeof this.message === 'string' ? this.message : this.message(this.propertyKey, value)
            return new CargoFieldError(this.propertyKey, message)
        }

        return null
    }
}

/**
 * Represents a validation rule that applies to each element of an array.
 */
export class EachValidatorRule extends ValidatorRule {
    private innerRule: ValidatorRule

    constructor(propertyKey: string | symbol, innerRule: ValidatorRule) {
        super(propertyKey, 'each', () => true, '')
        this.innerRule = innerRule
    }

    validate(value: any, instance?: Record<string | symbol, any>): CargoFieldError | null {
        if (!Array.isArray(value)) return null

        for (let i = 0; i < value.length; i++) {
            const item = value[i]
            const error = this.innerRule.validate(item, instance)
            if (error) {
                return new CargoFieldError(`${String(this.propertyKey)}[${i}]`, error.message)
            }
        }
        return null
    }
}

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

export type TypedPropertyDecorator<T> = <K extends string | symbol>(target: { [P in K]?: T }, propertyKey: K) => void
