import type { Request, RequestHandler } from 'express'

import { CargoFieldError, CargoValidationError } from './types'
import { CargoClassMetadata, CargoFieldMetadata } from './metadata'

export function bindingCargo<T extends object = any>(cargoClass: new () => T): RequestHandler {
    return (req, res, next) => {
        try {
            const cargo = new cargoClass() as any
            const classMeta = new CargoClassMetadata(cargoClass.prototype)
            const errors: CargoFieldError[] = []

            const getErrorKey = (sourceKey: string, currentKey: string): string => {
                return sourceKey ? `${sourceKey}.${currentKey}` : currentKey
            }

            const bindObject = (
                targetObject: any,
                metaClass: CargoClassMetadata,
                parentSource: string | symbol,
                sourceData: any,
                sourceKey: string,
            ) => {
                const fields = metaClass.getFieldList()
                for (const property of fields) {
                    const meta: CargoFieldMetadata = metaClass.getFieldMetadata(property)
                    if (!meta) continue

                    let value
                    const metaKey = meta.getKey()
                    const key = typeof metaKey === 'string' ? metaKey : metaKey.description

                    if (!key) {
                        errors.push(new CargoFieldError(getErrorKey(sourceKey, key!), 'empty string or symbol is not allowed'))
                        continue
                    }

                    const currentSource = meta.getSource()

                    switch (currentSource) {
                        case parentSource:
                            value = sourceData?.[key]
                            break
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
                            targetObject[property] = undefined
                            continue
                        } else {
                            errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} is required`))
                            continue
                        }
                    }

                    switch (meta.type) {
                        case String:
                            targetObject[property] = String(value)
                            break
                        case Number:
                            targetObject[property] = isNaN(Number(value)) ? value : Number(value)
                            break
                        case Boolean:
                            targetObject[property] = value === true || value === 'true'
                            break
                        case Date:
                            targetObject[property] = new Date(value)
                            break
                        default: {
                            const childClass = meta.type
                            const childClassMeta = new CargoClassMetadata(childClass.prototype)
                            const childObject = new childClass()
                            bindObject(childObject, childClassMeta, currentSource, value, getErrorKey(sourceKey, key))
                            targetObject[property] = childObject
                            break
                        }
                    }

                    for (const rule of meta.getValidators()) {
                        if (!rule.validate(value)) {
                            errors.push(new CargoFieldError(key, rule.message))
                        }
                    }
                }
            }
            bindObject(cargo, classMeta, 'initial', null, '')

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
