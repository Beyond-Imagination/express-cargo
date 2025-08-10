import type { Request, RequestHandler } from 'express'

import { CargoFieldError, CargoValidationError } from './types'
import { CargoClassMetadata, CargoFieldMetadata } from './metadata'

function isPrimitiveType(type: new () => any): boolean {
    return type === String || type === Number || type === Boolean || type === Date || type === Array || type === Object
}

function bindValue<T extends object>(value: any, cargoClass: new () => T, baseKey: string): { cargo: T; errors: CargoFieldError[] } {
    const cargo = new cargoClass() as any
    const classMeta = new CargoClassMetadata(cargoClass)
    const errors: CargoFieldError[] = []

    const fields = classMeta.getFieldList()
    for (const property of fields) {
        const meta: CargoFieldMetadata = classMeta.getFieldMetadata(property)
        if (!meta) continue

        const key = meta.getKey() as string
        const fullKey = `${baseKey}.${key}`
        const propertyValue = value?.[key]
        if (propertyValue === undefined || propertyValue === null) {
            if (meta.getOptional()) {
                cargo[property] = undefined
                continue
            } else {
                errors.push(new CargoFieldError(fullKey, `${fullKey} is required`))
                continue
            }
        }

        const fieldType = meta.getType()
        if (!isPrimitiveType(fieldType)) {
            const result = bindValue(propertyValue, fieldType, fullKey)
            cargo[property] = result.cargo
            errors.push(...result.errors)
        } else {
            for (const rule of meta.getValidators()) {
                if (!rule.validate(propertyValue)) {
                    errors.push(new CargoFieldError(fullKey, rule.message))
                }
            }
            cargo[property] = propertyValue
        }
    }

    return { cargo, errors }
}

export function bindingCargo<T extends object = any>(cargoClass: new () => T): RequestHandler {
    return (req, res, next) => {
        try {
            const cargo = new cargoClass() as any
            const classMeta = new CargoClassMetadata(cargoClass)
            let errors: CargoFieldError[] = []

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
                        cargo[property] = undefined
                        continue
                    } else {
                        errors.push(new CargoFieldError(key, `${key} is required`))
                        continue
                    }
                }

                const fieldType = meta.getType()
                if (!isPrimitiveType(fieldType)) {
                    const result = bindValue(value, fieldType, key)
                    cargo[property] = result.cargo
                    errors = errors.concat(result.errors)
                } else {
                    for (const rule of meta.getValidators()) {
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
