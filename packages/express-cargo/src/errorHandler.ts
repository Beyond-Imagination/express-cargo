import { Request, Response, NextFunction } from 'express'
import { CargoValidationError } from './types'

export type CargoErrorHandler = (err: CargoValidationError, req: Request, res: Response, next: NextFunction) => void

let globalCargoErrorHandler = (err: CargoValidationError, req: Request, res: Response, next: NextFunction) => {
    next(err)
}

/**
 * Sets the global error handler for Cargo validation errors.
 * This handler will be invoked when a `CargoValidationError` occurs during binding.
 * @param handler - The error handler function.
 */
export function setCargoErrorHandler(handler: CargoErrorHandler) {
    globalCargoErrorHandler = handler
}

/**
 * Retrieves the currently configured global error handler.
 * @returns The current error handler.
 */
export function getCargoErrorHandler(): CargoErrorHandler | null {
    return globalCargoErrorHandler
}
