import "reflect-metadata";
import { Request, Response, NextFunction, RequestHandler } from 'express'

export * from './binding'

export function bindingCargo(): RequestHandler {
    return function (req: Request, res: Response, next: NextFunction) {
        console.log(req, res, next)
        next()
    }
}

export function getCargo(req: Request) {
    return req._cargo
}
