import type { Request, RequestHandler } from 'express'

import { CargoFieldError, CargoFieldMetadata, CargoValidationError } from './types'
import { getFieldMetadata, getFieldList } from './metadata'

export function bindingCargo<T extends object = any>(cargoClass: new () => T): RequestHandler {
    return (req, res, next) => {
        try {
            const cargo = new cargoClass() as any
            const prototype = cargoClass.prototype
            const errors: CargoFieldError[] = []

            const fields = getFieldList(prototype)
            for (const property of fields) {
                const meta: CargoFieldMetadata = getFieldMetadata(prototype, property)
                if (!meta) continue

                if (meta.source) {
                    let value
                    const key = typeof meta.key === 'string' ? meta.key : meta.key.description

                    if (!key) {
                        errors.push(new CargoFieldError(key!, 'empty string or symbol is not allowed'))
                        continue
                    }

                    switch (meta.source) {
                        case 'body':
                            value = req.body?.[key]
                            break
                        case 'query':
                            value = req.query?.[key]
                            break
                        case 'uri':
                            value = req.params?.[key]
                            break
                        case 'header':
                            value = req.headers?.[String(key).toLowerCase()]
                            break
                        case 'session':
                            value = (req as any).session?.[key]
                            break
                    }

                    if (value === undefined || value === null) {
                        if (meta.optional) {
                            cargo[property] = undefined;
                            continue; 
                        } else {
                            errors.push(new CargoFieldError(key, `${key} is required`));
                            continue; 
                        }
                    }

                    for (const rule of meta.validators) {
                        if (!rule.validate(value)) {
                            errors.push(new CargoFieldError(key, rule.message))
                        }
                    }

                    cargo[property] = value
                }
            }

            if (errors.length > 0) {
                throw new CargoValidationError(errors)
            }

            req._cargo = cargo
            next()
        } catch (err) {
            next(err)
        }
    }
}

export function getCargo<T extends object>(req: Request): T | undefined {
    return req._cargo as T
}
