// errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { CargoValidationError } from './types'

export type CargoErrorHandler = (err: CargoValidationError, req: Request, res: Response, next: NextFunction) => void

let globalCargoErrorHandler: CargoErrorHandler | null = null

export function setCargoErrorHandler(handler: CargoErrorHandler) {
    globalCargoErrorHandler = handler
}

export function getCargoErrorHandler(): CargoErrorHandler | null {
    return globalCargoErrorHandler
}

export function cargoErrorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (err instanceof CargoValidationError) {
        const handler = getCargoErrorHandler()

        if (handler) {
            return handler(err, req, res, next)
        }

        return res.status(400).json({
            message: err.message,
            errors: err.errors.map(e => ({
                name: e.name,
                message: e.message,
            })),
        })
    }

    next(err)
}
