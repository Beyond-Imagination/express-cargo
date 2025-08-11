import type { Request, RequestHandler } from 'express'

import { CargoFieldError, CargoValidationError } from './types'
import { CargoClassMetadata, CargoFieldMetadata } from './metadata'

export function bindingCargo<T extends object = any>(cargoClass: new () => T): RequestHandler {
    return (req, res, next) => {
        try {
            const cargo = new cargoClass() as any
            const classMeta = new CargoClassMetadata(cargoClass.prototype)
            const errors: CargoFieldError[] = []

            const fields = classMeta.getFieldList()
            for (const property of fields) {
                const meta: CargoFieldMetadata = classMeta.getFieldMetadata(property)
                if (!meta) continue

                let value
                const metaKey = meta.getKey()
                const key = typeof metaKey === 'string' ? metaKey : metaKey.description

                if (!key) {
                    errors.push(new CargoFieldError(key!, 'empty string or symbol is not allowed'))
                    continue
                }

                switch (meta.getSource()) {
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
                    if (meta.getOptional()) {
                        cargo[property] = undefined;
                        continue;
                    } else {
                        errors.push(new CargoFieldError(key, `${key} is required`));
                        continue;
                    }
                }

                switch (meta.type) {
                    case String:
                        value = String(value)
                        break
                    case Number:
                        value = isNaN(Number(value)) ? value : Number(value)
                        break
                    case Boolean:
                        value = value === true || value === 'true'
                        break
                    case Date:
                        value = new Date(value)
                        break
                    default:
                        // TODO: object 처리
                        break
                }

                for (const rule of meta.getValidators()) {
                    if (!rule.validate(value)) {
                        errors.push(new CargoFieldError(key, rule.message))
                    }
                }

                cargo[property] = value
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
