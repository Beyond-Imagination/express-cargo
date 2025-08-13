import type { Request, RequestHandler } from 'express'

import { CargoFieldError, CargoValidationError } from './types'
import { CargoClassMetadata, CargoFieldMetadata } from './metadata'

export function bindingCargo<T extends object = any>(cargoClass: new () => T): RequestHandler {
    return (req, res, next) => {
        try {
            const errors: CargoFieldError[] = []

            const getErrorKey = (sourceKey: string, currentKey: string): string => {
                return sourceKey ? `${sourceKey}.${currentKey}` : currentKey
            }

            const bindObject = (
                objectClass: any,
                parentSource: string | symbol,
                sourceData: any,
                sourceKey: string,
                allSource: { body: any, query: any, uri: any, header: any, session: any },
                visitedObjects: Map<any, any> = new Map(),
            ): any => {
                if (visitedObjects.has(objectClass)) {
                    return visitedObjects.get(objectClass)
                }

                const metaClass = new CargoClassMetadata(objectClass.prototype)
                const targetObject = new objectClass()

                visitedObjects.set(objectClass, targetObject)

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
                            value = allSource.body?.[key]
                            break
                        case 'query':
                            value = allSource.query?.[key]
                            break
                        case 'uri':
                            value = allSource.uri?.[key]
                            break
                        case 'header':
                            value = allSource.header?.[String(key).toLowerCase()]
                            break
                        case 'session':
                            value = (req as any).session?.[key]
                            break
                    }

                    const transformer = meta.getTransformer()
                    if (transformer) {
                        value = transformer(value)
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
                        default:
                            targetObject[property] = bindObject(meta.type, currentSource, value, getErrorKey(sourceKey, key), allSource)
                            break
                    }

                    for (const rule of meta.getValidators()) {
                        if (!rule.validate(value)) {
                            errors.push(new CargoFieldError(key, rule.message))
                        }
                    }
                }
                return targetObject
            }
            const allSources = {
                body: req.body,
                query: req.query,
                uri: req.params,
                header: req.headers,
                session: (req as any).session,
            }
            const cargo = bindObject(cargoClass, 'initial', null, '', allSources)

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
