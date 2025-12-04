import express, { NextFunction, Request, Response, Router } from 'express'
import {
    bindingCargo,
    Body,
    CargoFieldError,
    CargoTransformFieldError,
    CargoValidationError,
    email,
    getCargo,
    getCargoErrorHandler,
    maxLength,
    setCargoErrorHandler,
    Transform,
} from 'express-cargo'

const router: Router = express.Router()

const saveAndBypassErrorHandler = (req: Request, res: Response, next: NextFunction) => {
    const originalHandler = getCargoErrorHandler()

    res.on('finish', () => {
        if (originalHandler) {
            setCargoErrorHandler(originalHandler)
        }
    })

    setCargoErrorHandler((error, req, res, next) => next(error))
    next()
}

const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof CargoValidationError) {
        res.status(400).json({
            name: error.name,
            errors: error.errors,
            message: error.message,
        })
    } else if (error instanceof CargoTransformFieldError || error instanceof CargoFieldError) {
        res.status(400).json({
            name: error.name,
            field: error.field,
            message: error.message,
        })
    } else {
        res.status(500).json({
            name: 'Internal Server Error',
            message: error.message,
        })
    }
}

class ErrorHandlerExample {
    @Body()
    @maxLength(10)
    name!: string

    @Body()
    @email()
    @Transform((target: string) => target.toLowerCase())
    email!: string
}

router.use(saveAndBypassErrorHandler)

router.post('/error-handler', bindingCargo(ErrorHandlerExample), (req, res) => {
    const cargo = getCargo<ErrorHandlerExample>(req)
    res.json(cargo)
})

router.use(errorHandler)

export default router
