import { AnalysisResult, Source, TypeResolver, TypeThunk, TypeOptions } from '../types'
import { CargoFieldError, CargoTransformFieldError } from '../errors'
import { BindContext, BindSources } from './types'
import { CargoClassMetadata, CargoFieldMetadata } from '../metadata'
import { CargoFile } from '../fileHandler'
import { validateAnalysis } from '../rules'
import { isClass, isUserDefinedClass } from '../utils'
import { analyzeCargoSchema } from '../analysis'
import { getErrorKey, getFieldKey, validateField, handleMissing } from './fieldHelpers'

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
    analysis: AnalysisResult,
): void {
    if (meta.getEnumType() !== undefined) {
        targetObject[property] = value
    } else {
        targetObject[property] = typeCasting(meta.type, meta, sourceKey, key, value, errors, sources, currentSource, analysis)
    }

    const transformer = meta.getTransformer()
    if (transformer) {
        targetObject[property] = transformer(targetObject[property])
    }
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
    analysis: AnalysisResult,
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
            return typeCasting(elementType, meta, sourceKey, `${key}[${i}]`, element, errors, sources, currentSource, analysis)
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
    if (isUserDefinedClass(targetClass) && typeof value === 'object' && value !== null) {
        const nextSources = { ...sources, [currentSource]: value }
        const nestedMetaFromMap = analysis.metadataMap.get(targetClass)
        let targetAnalysis = analysis
        if (!nestedMetaFromMap) {
            targetAnalysis = analyzeCargoSchema(targetClass)
            validateAnalysis(targetAnalysis)
        }
        const nestedMeta = nestedMetaFromMap || targetAnalysis.rootMeta

        return bindObject(targetClass, nestedMeta, nextSources, errors, targetAnalysis, getErrorKey(sourceKey, key))
    }

    // Fallback: Return raw value if no further transformation is possible
    return value
}

export function bindObject(
    objectClass: any,
    metaClass: CargoClassMetadata,
    sources: BindSources,
    errors: CargoFieldError[],
    analysis: AnalysisResult,
    sourceKey: string = '',
): any {
    const targetObject = new objectClass()
    const context: BindContext = {
        metaClass,
        targetObject,
        sources,
        errors,
        sourceKey,
    }

    bindRequest(context)
    bindSource(context, analysis)
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

function bindSource({ metaClass, targetObject, sources, errors, sourceKey }: BindContext, analysis: AnalysisResult): void {
    for (const property of metaClass.getFieldList()) {
        const meta = metaClass.getFieldMetadata(property)
        if (meta.getRequestTransformer()) continue

        const key = getFieldKey(meta, sourceKey, errors)
        if (!key) continue

        const currentSource = meta.getSource()

        // Uploaded files share one map; `@UploadedFile` takes the first entry, `@UploadedFiles` takes them all.
        if (currentSource === 'file' || currentSource === 'files') {
            bindFile(meta, property, key, sources.file?.[key], currentSource === 'files', targetObject, errors, sourceKey)
            continue
        }

        let value
        const currentSourceData = sources[currentSource as keyof BindSources]
        if (currentSourceData) {
            value = currentSourceData[key]
        }

        const shouldSkipField = handleMissing(meta, property, key, value, targetObject, errors, sourceKey)

        if (shouldSkipField) {
            continue
        }

        transformSource(meta, property, key, value, targetObject, errors, sources, sourceKey, currentSource, analysis)
        validateField(meta, property, targetObject, errors)
    }
}

// Binds an uploaded file field. `@UploadedFiles` receives the whole array; `@UploadedFile` takes the first entry.
function bindFile(
    meta: CargoFieldMetadata,
    property: string | symbol,
    key: string,
    files: CargoFile[] | undefined,
    multiple: boolean,
    targetObject: any,
    errors: CargoFieldError[],
    sourceKey: string,
): void {
    const value = files && files.length > 0 ? (multiple ? files : files[0]) : undefined

    if (handleMissing(meta, property, key, value, targetObject, errors, sourceKey)) {
        return
    }

    targetObject[property] = value
    validateField(meta, property, targetObject, errors)
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
