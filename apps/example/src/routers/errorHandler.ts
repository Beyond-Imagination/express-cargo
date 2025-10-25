import express, { NextFunction, Request, Response, Router } from 'express'
import {
    bindingCargo,
    body,
    CargoFieldError,
    CargoTransformFieldError,
    CargoValidationError,
    email,
    getCargo,
    getCargoErrorHandler,
    maxLength,
    setCargoErrorHandler,
    transform,
} from 'express-cargo'

const router: Router = express.Router()

let errorHandlerTemp

const saveErrorHandler = (req: Request, res: Response, next: NextFunction) => {
    errorHandlerTemp = getCargoErrorHandler()
    setCargoErrorHandler((error, req, res, next) => next(error))
    next()
}

const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    setCargoErrorHandler(errorHandlerTemp!)
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
    @body()
    @maxLength(10)
    name!: string

    @body()
    @email()
    @transform((target: string) => target.toLowerCase())
    email!: string
}

router.use(saveErrorHandler)

router.post('/error-handler', bindingCargo(ErrorHandlerExample), (req, res) => {
    const cargo = getCargo<ErrorHandlerExample>(req)
    res.json(cargo)
})

router.use(errorHandler)

export default router
