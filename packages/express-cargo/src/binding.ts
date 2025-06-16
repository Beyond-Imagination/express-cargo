import type { Request, RequestHandler } from 'express'

import { CargoFieldMetadata } from './types'
import { getFieldMetadata } from './metadata'

export function bindingCargo<T extends object = any>(cargoClass: new () => T): RequestHandler {
    return (req, res, next) => {
        try {
            const cargo = new cargoClass() as any
            const prototype = cargoClass.prototype

            for (const property of Object.getOwnPropertyNames(prototype)) {
                const meta: CargoFieldMetadata = getFieldMetadata(prototype, property)
                if (!meta) continue

                if (meta.source) {
                    let value
                    const key = typeof meta.key === 'string' ? meta.key : meta.key.description

                    if (!key) {
                        throw new Error('empty string or symbol is not allowed')
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

                    cargo[property] = value
                }
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
