import { CargoFieldError } from './errors'
import type { CargoErrorMessage } from './types'

type ValidatorFunction = (value: any, instance?: Record<string | symbol, any>) => boolean

/**
 * Represents a validation rule for a property.
 */
export class ValidatorRule {
    type: string
    propertyKey: string | symbol
    validateFunction: ValidatorFunction
    message: CargoErrorMessage

    constructor(propertyKey: string | symbol, type: string, validate: ValidatorFunction, message: CargoErrorMessage) {
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
