import 'reflect-metadata'
import express, { NextFunction, Request, Response, Router } from 'express'
import { classValidatorRouter } from '../testcase/libraries/class-validator/routes'
import { expressCargoRouter } from '../testcase/libraries/express-cargo/routes'
import { validationFailureScenario } from '../testcase/scenarios'
import { zodRouter } from '../testcase/libraries/zod/routes'

type ErrorResponse = { error: string }

const INTERNAL_ERROR_RESPONSE: ErrorResponse = { error: 'internal server error' }

export const app = express()
app.use(express.json())

// One lookup picks the library's router. Mounting each router with app.use(prefix) would make a request walk past
// the routers registered before its own, so the libraries registered later would pay more routing per request.
const routers = new Map<string, Router>([
    ['/express-cargo', expressCargoRouter],
    ['/zod', zodRouter],
    ['/class-validator', classValidatorRouter],
])
app.use((req, res, next) => {
    const prefixEnd = req.url.indexOf('/', 1)
    const prefix = prefixEnd === -1 ? req.url : req.url.slice(0, prefixEnd)
    const router = routers.get(prefix)
    if (router === undefined) return next()

    // Strip the prefix the way a mounted router sees it, and restore the URL if the router passes the request on.
    const url = req.url
    req.url = url.slice(prefix.length) || '/'
    req.baseUrl = prefix
    router(req, res, error => {
        req.url = url
        req.baseUrl = ''
        next(error)
    })
})
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
