import { Request, RequestHandler } from 'express'
import { bodyKey, FieldMetadata, headerKey, queryKey, sessionKey, sourceKeys, uriKey } from './types'

function bindingCargo<T extends object = any>(cargoClass: new () => T): RequestHandler {
    return (req, res, next) => {
        try {
            const cargo = new cargoClass() as any

            for (const sourceKey of sourceKeys) {
                const fields: FieldMetadata[] = Reflect.getMetadata(sourceKey, cargoClass.prototype) || []

                for (const field of fields) {
                    let value

                    const key = typeof field.key === 'string'
                        ? field.key
                        : field.key.description || ""

                    switch (sourceKey) {
                        case bodyKey:
                            value = req.body?.[key]
                            break
                        case queryKey:
                            value = req.query?.[key]
                            break
                        case uriKey:
                            value = req.params?.[key]
                            break
                        case headerKey:
                            value = req.headers?.[key.toLowerCase()]
                            break
                        case sessionKey:
                            value = (req as any).session?.[key]
                            break
                    }

                    cargo[field.property] = value
                }
            }

            req._cargo = cargo
            next()
        } catch (err) {
            next(err)
        }
    }
}

export function getCargo(req: Request) {
    return req._cargo
}
