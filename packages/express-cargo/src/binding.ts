import type { Request, RequestHandler } from 'express'

import { CargoFieldError, CargoValidationError, CargoTransformFieldError } from './types'
import { CargoClassMetadata, CargoFieldMetadata } from './metadata'

function getErrorKey(sourceKey: string, currentKey: string): string {
    return sourceKey ? `${sourceKey}.${currentKey}` : currentKey
}

function bindObject(
    objectClass: any,
    sources: { req: Request; body: any; query: any; uri: any; header: any; session: any },
    errors: CargoFieldError[],
    sourceKey: string = '',
): any {
    const metaClass = new CargoClassMetadata(objectClass.prototype)
    const targetObject = new objectClass()
    const fields = metaClass.getFieldList()
    const virtualFields: (string | symbol)[] = []

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

        const requestTransformer = meta.getRequestTransformer()
        if (requestTransformer) {
            try {
                value = requestTransformer(sources.req)
            } catch (error) {
                errors.push(
                    new CargoTransformFieldError(
                        property,
                        `Error while computing request transform field: ${error instanceof Error ? error.message : String(error)}`,
                    ),
                )
                continue
            }

            if (value === undefined || value === null) {
                if (meta.getOptional()) {
                    targetObject[property] = null
                } else {
                    errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} is required`))
                }
            } else {
                targetObject[property] = value
            }
            continue
        }

        if (meta.getVirtualTransformer()) {
            virtualFields.push(property)
            continue
        }

        const currentSource = meta.getSource()
        const currentSourceData = sources[currentSource as keyof typeof sources]

        if (currentSourceData) {
            value = currentSourceData[key]
        }

        if (value === undefined || value === null) {
            if (meta.getOptional()) {
                targetObject[property] = null
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
                const nextSources = { ...sources, [currentSource]: value }
                targetObject[property] = bindObject(meta.type, nextSources, errors, getErrorKey(sourceKey, key))
                break
            }
        }

        const transformer = meta.getTransformer()
        if (transformer) {
            targetObject[property] = transformer(targetObject[property])
        }

        for (const rule of meta.getValidators()) {
            if (!rule.validate(targetObject[property])) {
                errors.push(new CargoFieldError(key, rule.message))
            }
        }
    }

    for (const property of virtualFields) {
        const meta = metaClass.getFieldMetadata(property)
        const transformer = meta.getVirtualTransformer()
        try {
            targetObject[property] = transformer!(targetObject)
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
                uri: req.params,
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
            next(err)
        }
    }
}

export function getCargo<T extends object>(req: Request): T | undefined {
    return req._cargo as T
}
