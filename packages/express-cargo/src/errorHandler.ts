import { Request, Response, NextFunction } from 'express'
import { CargoValidationError } from './types'

export type CargoErrorHandler = (err: CargoValidationError, req: Request, res: Response, next: NextFunction) => void

let globalCargoErrorHandler = (err: CargoValidationError, req: Request, res: Response, next: NextFunction) => {
    next(err)
}

export function setCargoErrorHandler(handler: CargoErrorHandler) {
    globalCargoErrorHandler = handler
}

export function getCargoErrorHandler(): CargoErrorHandler | null {
    return globalCargoErrorHandler
}
