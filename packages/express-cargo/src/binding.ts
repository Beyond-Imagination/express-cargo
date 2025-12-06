import type { Request, RequestHandler } from 'express'

import { CargoFieldError, CargoValidationError, CargoTransformFieldError, Source, ArrayElementType } from './types'
import { CargoClassMetadata, CargoFieldMetadata } from './metadata'
import { getCargoErrorHandler } from './errorHandler'

function getErrorKey(sourceKey: string, currentKey: string): string {
    return sourceKey ? `${sourceKey}.${currentKey}` : currentKey
}

function typeCasting(
    type: any,
    elementType: ArrayElementType | undefined,
    sourceKey: string,
    key: string,
    value: any,
    errors: CargoFieldError[],
    sources: any,
    currentSource: Source,
): any {
    switch (type) {
        case String:
            return String(value)
        case Number: {
            const parsedNumber = Number(value)
            if (isNaN(parsedNumber) || (typeof value === 'string' && value.trim() === '')) {
                errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} must be a valid number`))
                return undefined
            }
            return parsedNumber
        }
        case Boolean:
            return value === true || value === 'true'
        case Date: {
            const parsedDate = new Date(value)
            if (isNaN(parsedDate.getTime())) {
                errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} must be a valid date`))
                return undefined
            }
            return parsedDate
        }
        case Array: {
            if (!Array.isArray(value)) {
                errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} must be an array`))
                return undefined
            }
            if (!elementType) return value
            return value.map((element, i) => typeCasting(elementType, undefined, sourceKey, `${key}[${i}]`, element, errors, sources, currentSource))
        }
        default: {
            const nextSources = { ...sources, [currentSource]: value }
            return bindObject(type, nextSources, errors, getErrorKey(sourceKey, key))
        }
    }
}

function bindObject(
    objectClass: any,
    sources: { req: Request; body: any; query: any; params: any; header: any; session: any },
    errors: CargoFieldError[],
    sourceKey: string = '',
): any {
    const metaClass = new CargoClassMetadata(objectClass.prototype)

    metaClass.markBindingCargoCalled()

    const targetObject = new objectClass()
    const fields = metaClass.getFieldList()
    const requestFields = metaClass.getRequestFieldList()
    const virtualFields = metaClass.getVirtualFieldList()

    // request transform
    for (const property of requestFields) {
        const meta: CargoFieldMetadata = metaClass.getFieldMetadata(property)
        if (!meta) continue

        let value
        const metaKey = meta.getKey()
        const key = typeof metaKey === 'string' ? metaKey : metaKey.description

        if (!key) {
            errors.push(new CargoFieldError(getErrorKey(sourceKey, key!), 'empty string or symbol is not allowed'))
            continue
        }

        const requestTransformer = meta.getRequestTransformer()
        if (!requestTransformer) {
            errors.push(new CargoTransformFieldError(property, `${key} does not have transformer`))
            continue
        }

        try {
            value = requestTransformer(sources.req)
            if (value === undefined || value === null) {
                if (meta.getDefault() !== undefined) {
                    targetObject[property] = meta.getDefault()
                    continue
                } else if (meta.getOptional()) {
                    targetObject[property] = null
                } else {
                    errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} is required`))
                }
            } else {
                targetObject[property] = value
            }
            for (const rule of meta.getValidators()) {
                const error = rule.validate(targetObject[property])
                if (error) {
                    errors.push(error)
                }
            }
        } catch (error) {
            errors.push(
                new CargoTransformFieldError(
                    property,
                    `Error while computing request transform field: ${error instanceof Error ? error.message : String(error)}`,
                ),
            )
        }
    }

    // source decorator parsing
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
        const currentSourceData = sources[currentSource as keyof typeof sources]

        if (currentSourceData) {
            value = currentSourceData[key]
        }

        if (value === undefined || value === null) {
            if (meta.getDefault() !== undefined) {
                targetObject[property] = meta.getDefault()
                continue
            } else if (meta.getOptional()) {
                targetObject[property] = null
                continue
            } else {
                errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} is required`))
                continue
            }
        }

        if (meta.getEnumType() !== undefined) {
            targetObject[property] = value
        } else {
            targetObject[property] = typeCasting(meta.type, meta.getArrayElementType(), sourceKey, key, value, errors, sources, currentSource)
        }

        const transformer = meta.getTransformer()
        if (transformer) {
            targetObject[property] = transformer(targetObject[property])
        }

        for (const rule of meta.getValidators()) {
            const error = rule.validate(targetObject[property])
            if (error) {
                errors.push(error)
            }
        }
    }

    // virtual transform
    for (const property of virtualFields) {
        const meta = metaClass.getFieldMetadata(property)
        if (!meta) continue

        let value
        const metaKey = meta.getKey()
        const key = typeof metaKey === 'string' ? metaKey : metaKey.description

        if (!key) {
            errors.push(new CargoFieldError(getErrorKey(sourceKey, key!), 'empty string or symbol is not allowed'))
            continue
        }

        const virtualTransformer = meta.getVirtualTransformer()
        if (!virtualTransformer) {
            errors.push(new CargoTransformFieldError(property, `${key} does not have transformer`))
            continue
        }

        try {
            value = virtualTransformer(targetObject)
            if (value === undefined || value === null) {
                if (meta.getDefault() !== undefined) {
                    targetObject[property] = meta.getDefault()
                    continue
                } else if (meta.getOptional()) {
                    targetObject[property] = null
                } else {
                    errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} is required`))
                }
            } else {
                targetObject[property] = value
            }
            for (const rule of meta.getValidators()) {
                const error = rule.validate(targetObject[property])
                if (error) {
                    errors.push(error)
                }
            }
        } catch (error) {
            errors.push(
                new CargoTransformFieldError(
                    property,
                    `Error while computing virtual field: ${error instanceof Error ? error.message : String(error)}`,
                ),
            )
        }
    }

    return targetObject
}

export function bindingCargo<T extends object = any>(cargoClass: new () => T): RequestHandler {
    return (req, res, next) => {
        try {
            const errors: CargoFieldError[] = []
            const sources = {
                req: req,
                body: req.body,
                query: req.query,
                params: req.params,
                header: req.headers,
                session: (req as any).session,
            }
            const cargo = bindObject(cargoClass, sources, errors)

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

export function getCargo<T extends object>(req: Request): T | undefined {
    return req._cargo as T
}
