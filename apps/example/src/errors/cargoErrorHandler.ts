import { CargoValidationError, setCargoErrorHandler } from 'express-cargo'
import { Request, Response, NextFunction } from 'express'

setCargoErrorHandler((err: CargoValidationError, req: Request, res: Response, next: NextFunction) => {
    res.status(422).json({
        code: 'VALIDATION_ERROR',
        message: 'The provided input is invalid.',
        details: err.errors.map(e => ({
            name: e.name,
            message: e.message,
        })),
    })
})
