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

                    switch (sourceKey) {
                        case bodyKey:
                            value = req.body?.[field.key]
                            break
                        case queryKey:
                            value = req.query?.[field.key.toString()]
                            break
                        case uriKey:
                            value = req.params?.[field.key.toString()]
                            break
                        case headerKey:
                            value = req.headers?.[String(field.key).toLowerCase()]
                            break
                        case sessionKey:
                            value = req.session?.[field.key]
                            break
                    }

                    cargo[field.key] = value
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
