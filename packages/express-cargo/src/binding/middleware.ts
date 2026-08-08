import type { Request, RequestHandler } from 'express'

import { ClassConstructor } from '../types'
import { CargoFieldError, CargoValidationError } from '../errors'
import { getCargoErrorHandler } from '../errorHandler'
import { getCargoFileLocator } from '../fileHandler'
import { validateAnalysis } from '../rules'
import { analyzeCargoSchema } from '../analysis'
import { bindObject } from './bind'

/**
 * Middleware that binds request data to a class instance and validates it.
 *
 * @param cargoClass - The class constructor to bind the request data to.
 * @returns An Express RequestHandler.
 *
 * @example
 * ```typescript
 * app.post('/users', bindingCargo(CreateUser), (req, res) => {
 *   const userDto = getCargo<CreateUser>(req);
 *   // ...
 * });
 * ```
 */
export function bindingCargo<T extends object = any>(cargoClass: ClassConstructor<T>): RequestHandler {
    // Fail fast on schema mistakes at route-registration time instead of on the first request.
    const result = analyzeCargoSchema(cargoClass)
    validateAnalysis(result)

    return (req, res, next) => {
        try {
            const errors: CargoFieldError[] = []
            // Normalize uploaded files once; @UploadedFile and @UploadedFiles share the same map.
            const uploadedFiles = getCargoFileLocator()(req)
            const sources = {
                req: req,
                body: req.body,
                query: req.query,
                params: req.params,
                header: req.headers,
                session: (req as any).session,
                file: uploadedFiles,
            }
            const cargo = bindObject(cargoClass, result.rootMeta, sources, errors, result)

            if (errors.length > 0) {
                throw new CargoValidationError(errors)
            }

            req._cargo = cargo
            next()
        } catch (err) {
            if (err instanceof CargoValidationError) {
                const handler = getCargoErrorHandler()
                if (handler) {
                    return handler(err, req, res, next)
                }
            }
            next(err)
        }
    }
}

/**
 * Retrieves the bound cargo object from the request.
 *
 * @param req - The Express Request object.
 * @returns The bound class instance.
 * @throws If the binding middleware has not run for this request.
 */
export function getCargo<T extends object>(req: Request): T {
    const cargo = req._cargo
    if (cargo == null) {
        throw new Error('Cargo not found on the request. Register the bindingCargo() middleware on this route before calling getCargo().')
    }
    return cargo as T
}
