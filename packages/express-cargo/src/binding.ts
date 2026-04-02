import type { Request, RequestHandler } from 'express'

import type { BindContext, BindSources } from './types'
import { CargoFieldError, CargoValidationError, CargoTransformFieldError, Source, TypeResolver, TypeThunk, TypeOptions } from './types'
import { CargoClassMetadata, CargoFieldMetadata } from './metadata'
import { getCargoErrorHandler } from './errorHandler'

function getErrorKey(sourceKey: string, currentKey: string): string {
    return sourceKey ? `${sourceKey}.${currentKey}` : currentKey
}

function getFieldKey(meta: CargoFieldMetadata, sourceKey: string, errors: CargoFieldError[]): string | undefined {
    const metaKey = meta.getKey()
    const key = typeof metaKey === 'string' ? metaKey : metaKey.description

    if (!key) {
        errors.push(new CargoFieldError(getErrorKey(sourceKey, String(metaKey)), 'empty string or symbol is not allowed'))
        return undefined
    }

    return key
}

function validateField(meta: CargoFieldMetadata, property: string | symbol, targetObject: any, errors: CargoFieldError[]): void {
    for (const rule of meta.getValidators()) {
        const error = rule.validate(targetObject[property], targetObject)
        if (error) {
            errors.push(error)
        }
    }
}

function handleMissing(
    meta: CargoFieldMetadata,
    property: string | symbol,
    key: string,
    value: any,
    targetObject: any,
    errors: CargoFieldError[],
    sourceKey: string,
): boolean {
    if (value !== undefined && value !== null) {
        return false
    }

    if (meta.getDefault() !== undefined) {
        targetObject[property] = meta.getDefault()
        return true
    }

    if (meta.getOptional()) {
        targetObject[property] = null
        return true
    }

    errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} is required`))
    return true
}

function transformSource(
    meta: CargoFieldMetadata,
    property: string | symbol,
    key: string,
    value: any,
    targetObject: any,
    errors: CargoFieldError[],
    sources: BindSources,
    sourceKey: string,
    currentSource: Source,
): void {
    if (meta.getEnumType() !== undefined) {
        targetObject[property] = value
    } else {
        targetObject[property] = typeCasting(meta.type, meta, sourceKey, key, value, errors, sources, currentSource)
    }

    const transformer = meta.getTransformer()
    if (transformer) {
        targetObject[property] = transformer(targetObject[property])
    }
}

/**
 * Determines if a given function is a class constructor.
 * This is a heuristic check to support various transpilation environments (ES6+, Babel, etc.).
 */
function isClass(fn: any): boolean {
    if (typeof fn !== 'function') return false

    // Standard ES6 class declaration starts with 'class '
    if (fn.toString().startsWith('class ')) return true

    // Arrow functions and bound functions may not have a prototype
    if (!fn.prototype) return false

    // Heuristic: PascalCase naming and a valid constructor link usually indicate a class
    const hasPrototype = fn.prototype && fn.prototype.constructor === fn
    const isPascalCase = fn.name && /^[A-Z]/.test(fn.name)
    return isPascalCase && hasPrototype
}

/**
 * Resolves the target class constructor based on the provided Thunk, Resolver, or Options.
 * This handles both static polymorphism (Discriminator) and dynamic polymorphism (Resolver).
 */
function resolveTargetClass(typeFn: TypeThunk | TypeResolver, data: any, options?: TypeOptions): any {
    // Explicit Discriminator (Structural configuration)
    if (options?.discriminator) {
        const { property, subTypes } = options.discriminator
        const typeValue = data?.[property]
        const found = subTypes.find(t => t.name === typeValue)
        if (found) return found.value
    }

    // Return immediately if it's a class (prevents invocation error)
    if (isClass(typeFn)) return typeFn

    // Execute as Thunk/Resolver and return the resulting function
    const result = typeFn(data)
    if (typeof result === 'function') return result

    return undefined
}

/**
 * Main transformation pipeline that converts plain objects/values into class instances or primitives.
 */
function typeCasting(
    baseType: any,
    meta: CargoFieldMetadata | undefined,
    sourceKey: string,
    key: string,
    value: any,
    errors: CargoFieldError[],
    sources: any,
    currentSource: Source,
): any {
    // Handle Array types: Recursively process each element
    if (baseType === Array || Array.isArray(value)) {
        if (!Array.isArray(value)) {
            errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} must be an array`))
            return undefined
        }

        const elementType = meta?.getArrayElementType()
        if (!elementType) return value

        return value.map((element, i) => {
            // Pass the current meta to support polymorphism for array elements
            return typeCasting(elementType, meta, sourceKey, `${key}[${i}]`, element, errors, sources, currentSource)
        })
    }

    // Resolve target class for polymorphism via @Type decorator
    let targetClass = baseType
    if (meta) {
        const typeFn = meta.getTypeFn()

        if (typeFn) {
            const resolved = resolveTargetClass(typeFn, value, meta.getTypeOptions())
            if (resolved) targetClass = resolved
        }
    }

    // Handle Primitive types
    if (targetClass === String) {
        return String(value)
    } else if (targetClass === Number) {
        const parsedNumber = Number(value)
        if (isNaN(parsedNumber) || (typeof value === 'string' && value.trim() === '')) {
            errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} must be a valid number`))
            return undefined
        }
        return parsedNumber
    } else if (targetClass === Boolean) {
        return value === true || value === 'true'
    } else if (targetClass === Date) {
        const parsedDate = new Date(value)
        if (isNaN(parsedDate.getTime())) {
            errors.push(new CargoFieldError(getErrorKey(sourceKey, key), `${key} must be a valid date`))
            return undefined
        }
        return parsedDate
    }

    // Recursive binding: Transform nested plain objects into class instances
    if (isClass(targetClass) && typeof value === 'object' && value !== null) {
        const nextSources = { ...sources, [currentSource]: value }
        return bindObject(targetClass, nextSources, errors, getErrorKey(sourceKey, key))
    }

    // Fallback: Return raw value if no further transformation is possible
    return value
}

function bindObject(objectClass: any, sources: BindSources, errors: CargoFieldError[], sourceKey: string = ''): any {
    const metaClass = new CargoClassMetadata(objectClass.prototype)

    metaClass.markBindingCargoCalled()

    const targetObject = new objectClass()
    const context: BindContext = {
        metaClass,
        targetObject,
        sources,
        errors,
        sourceKey,
    }

    bindRequest(context)
    bindSource(context)
    bindVirtual(context)

    return targetObject
}

function bindRequest({ metaClass, targetObject, sources, errors, sourceKey }: BindContext): void {
    for (const property of metaClass.getRequestFieldList()) {
        const meta = metaClass.getFieldMetadata(property)
        const key = getFieldKey(meta, sourceKey, errors)
        if (!key) continue

        const requestTransformer = meta.getRequestTransformer()

        if (!requestTransformer) {
            errors.push(new CargoTransformFieldError(property, `${key} does not have transformer`))
            continue
        }

        try {
            const value = requestTransformer(sources.req)
            const shouldSkipField = handleMissing(meta, property, key, value, targetObject, errors, sourceKey)

            if (shouldSkipField) {
                continue
            }

            targetObject[property] = value
            validateField(meta, property, targetObject, errors)
        } catch (error) {
            errors.push(
                new CargoTransformFieldError(
                    property,
                    `Error while computing request transform field: ${error instanceof Error ? error.message : String(error)}`,
                ),
            )
        }
    }
}

function bindSource({ metaClass, targetObject, sources, errors, sourceKey }: BindContext): void {
    for (const property of metaClass.getFieldList()) {
        const meta = metaClass.getFieldMetadata(property)
        if (meta.getRequestTransformer()) continue

        const key = getFieldKey(meta, sourceKey, errors)
        if (!key) continue

        let value
        const currentSource = meta.getSource()
        const currentSourceData = sources[currentSource as keyof BindSources]

        if (currentSourceData) {
            value = currentSourceData[key]
        }

        const shouldSkipField = handleMissing(meta, property, key, value, targetObject, errors, sourceKey)

        if (shouldSkipField) {
            continue
        }

        transformSource(meta, property, key, value, targetObject, errors, sources, sourceKey, currentSource)
        validateField(meta, property, targetObject, errors)
    }
}

function bindVirtual({ metaClass, targetObject, errors, sourceKey }: BindContext): void {
    for (const property of metaClass.getVirtualFieldList()) {
        const meta = metaClass.getFieldMetadata(property)
        const key = getFieldKey(meta, sourceKey, errors)
        if (!key) continue

        const virtualTransformer = meta.getVirtualTransformer()

        if (!virtualTransformer) {
            errors.push(new CargoTransformFieldError(property, `${key} does not have transformer`))
            continue
        }

        try {
            const value = virtualTransformer(targetObject)
            const shouldSkipField = handleMissing(meta, property, key, value, targetObject, errors, sourceKey)

            if (shouldSkipField) {
                continue
            }

            targetObject[property] = value
            validateField(meta, property, targetObject, errors)
        } catch (error) {
            errors.push(
                new CargoTransformFieldError(
                    property,
                    `Error while computing virtual field: ${error instanceof Error ? error.message : String(error)}`,
                ),
            )
        }
    }
}

/**
 * Middleware that binds request data to a class instance and validates it.
 *
 * @param cargoClass - The class constructor to bind the request data to.
 * @returns An Express RequestHandler.
 *
 * @example
 * ```typescript
 * app.post('/users', bindingCargo(CreateUser), (req, res) => {
 *   const userDto = getCargo<CreateUser>(req);
 *   // ...
 * });
 * ```
 */
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

/**
 * Retrieves the bound cargo object from the request.
 *
 * @param req - The Express Request object.
 * @returns The bound class instance, or undefined if not found.
 */
export function getCargo<T extends object>(req: Request): T | undefined {
    return req._cargo as T
}
