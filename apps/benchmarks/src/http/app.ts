import 'reflect-metadata'
import express, { NextFunction, Request, Response } from 'express'
import { classValidatorRouter } from '../testcase/libraries/class-validator/routes'
import { expressCargoRouter } from '../testcase/libraries/express-cargo/routes'
import { validationFailureScenario } from '../testcase/scenarios'
import { zodRouter } from '../testcase/libraries/zod/routes'

type ErrorResponse = { error: string }

const INTERNAL_ERROR_RESPONSE: ErrorResponse = { error: 'internal server error' }

export const app = express()
app.use(express.json())
app.use('/express-cargo', expressCargoRouter)
app.use('/zod', zodRouter)
app.use('/class-validator', classValidatorRouter)
app.use((error: Error, _req: Request, res: Response<ErrorResponse>, _next: NextFunction) => {
    void _next
    const errorStatus = 'status' in error ? error.status : undefined
    const status = typeof errorStatus === 'number' && errorStatus >= 400 && errorStatus < 500 ? errorStatus : 500
    res.status(status).json(status < 500 ? validationFailureScenario.response : INTERNAL_ERROR_RESPONSE)
})

export const server = (() => {
    const port = Number(process.env.PORT ?? 3001)
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid PORT: ${process.env.PORT}`)
    }

    return app.listen(port, '127.0.0.1', () => {
        console.log(`Benchmark server listening on http://127.0.0.1:${port}`)
    })
})()
