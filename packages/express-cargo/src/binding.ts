import type { Request, RequestHandler } from 'express'

import { CargoFieldError, CargoValidationError, CargoVirtualFieldError } from './types'
import { CargoClassMetadata, CargoFieldMetadata } from './metadata'

export function bindingCargo<T extends object = any>(cargoClass: new () => T): RequestHandler {
    return (req, res, next) => {
        try {
            const cargo = new cargoClass() as any
            const classMeta = new CargoClassMetadata(cargoClass.prototype)
            const errors: CargoFieldError[] = []
            const virtualFields: (string | symbol)[] = []

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

                if (meta.isVirtual()) {
                    virtualFields.push(property)
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

                const transformer = meta.getTransformer()
                if (transformer) {
                    value = transformer(value)
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

            for (const property of virtualFields) {
                const meta = classMeta.getFieldMetadata(property)
                const computedFields = meta.getComputedFields()
                const transformer = meta.getVirtualTransformer()

                if (transformer && computedFields.length > 0) {
                    const values = computedFields.map(field => cargo[field])
                    const undefinedFields = values.filter(value => value === undefined)

                    if (undefinedFields.length > 0) {
                        errors.push(new CargoVirtualFieldError(property, `Virtual field relies on undefined fields: ${undefinedFields.join(', ')}`))
                        continue
                    }

                    try {
                        cargo[property] = transformer(...values)
                    } catch (error) {
                        errors.push(new CargoVirtualFieldError(property, `Error while computing virtual field: ${error.message}`))
                    }
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
