import { AnalysisResult, Source, TypeResolver, TypeThunk, TypeOptions } from '../types'
import { CargoFieldError, CargoTransformFieldError } from '../errors'
import { BindSources } from './types'
import { CargoClassMetadata, CargoFieldMetadata } from '../metadata'
import { CargoFile } from '../fileHandler'
import { validateAnalysis } from '../rules'
import { isClass, isUserDefinedClass } from '../utils'
import { analyzeCargoSchema } from '../analysis'
import { castError, getFieldKey, hasCastError, prefixErrors, validateCastField, validateField, handleMissing } from './fieldHelpers'

function transformSource(
    meta: CargoFieldMetadata,
    property: string | symbol,
    key: string,
    value: any,
    targetObject: any,
    errors: CargoFieldError[],
    sources: BindSources,
    currentSource: Source,
    analysis: AnalysisResult,
): void {
    const castStart = errors.length
    if (meta.getEnumType() !== undefined) {
        targetObject[property] = value
    } else {
        targetObject[property] = typeCasting(meta.type, meta, key, value, errors, sources, currentSource, analysis)
    }

    const transformer = meta.getTransformer()
    // Skip the transformer when casting failed: it would not receive a cast value, and the request fails anyway.
    if (transformer && (errors.length === castStart || !hasCastError(errors, castStart))) {
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
 * True when the field explicitly declares a nested DTO: through `@Type`, or as the class element type of `@List`.
 * A class that only comes from `design:type` is not enough, since `@Transform` may build it from a primitive.
 */
function declaresNestedType(baseType: any, meta: CargoFieldMetadata | undefined): boolean {
    if (meta?.getTypeFn()) return true
    return isUserDefinedClass(baseType) && baseType === meta?.getArrayElementType()
}

/** The analysis holding the given nested class: the current one, or a fresh one for a class only known at runtime. */
function analysisOf(targetClass: any, analysis: AnalysisResult): AnalysisResult {
    if (analysis.metadataMap.has(targetClass)) return analysis

    const targetAnalysis = analyzeCargoSchema(targetClass)
    validateAnalysis(targetAnalysis)
    return targetAnalysis
}

function metadataOf(targetClass: any, analysis: AnalysisResult): CargoClassMetadata {
    return analysis.metadataMap.get(targetClass) || analysis.rootMeta
}

/** Copies the sources for a nested bind, which reads its fields from the nested value instead of the parent's. */
function nestedSources(sources: BindSources, currentSource: Source, value: any): BindSources {
    // An explicit literal keeps one object shape per nested bind; spreading was measurably slower on large lists.
    const nextSources: BindSources = {
        req: sources.req,
        body: sources.body,
        query: sources.query,
        params: sources.params,
        header: sources.header,
        session: sources.session,
        file: sources.file,
    }
    nextSources[currentSource as keyof BindSources] = value
    return nextSources
}

/**
 * Binds a list whose elements all share one DTO class, resolving the class and the sources once per list.
 * The sources object can be reused because a bind reads it synchronously and never keeps it.
 */
function bindElements(
    elementClass: any,
    meta: CargoFieldMetadata,
    key: string,
    elements: any[],
    errors: CargoFieldError[],
    sources: BindSources,
    currentSource: Source,
    analysis: AnalysisResult,
): any[] {
    const elementAnalysis = analysisOf(elementClass, analysis)
    const elementMeta = metadataOf(elementClass, elementAnalysis)
    const elementSources = nestedSources(sources, currentSource, undefined)

    return elements.map((element, i) => {
        // Anything but a plain object goes through typeCasting, which reports it.
        if (typeof element !== 'object' || element === null || Array.isArray(element)) {
            return typeCasting(elementClass, meta, `${key}[${i}]`, element, errors, sources, currentSource, analysis)
        }

        elementSources[currentSource as keyof BindSources] = element
        const errorStart = errors.length
        const bound = bindObject(elementClass, elementMeta, elementSources, errors, elementAnalysis)
        if (errors.length > errorStart) prefixErrors(errors, errorStart, `${key}[${i}]`)
        return bound
    })
}

/**
 * Main transformation pipeline that converts plain objects/values into class instances or primitives.
 */
function typeCasting(
    baseType: any,
    meta: CargoFieldMetadata | undefined,
    key: string,
    value: any,
    errors: CargoFieldError[],
    sources: any,
    currentSource: Source,
    analysis: AnalysisResult,
): any {
    // A declared nested DTO (field or list element) must receive an object, not an array.
    // The raw value is kept so validators see the same input as before this check existed.
    if (Array.isArray(value) && baseType !== Array && declaresNestedType(baseType, meta)) {
        errors.push(castError(key, `${key} must be an object`))
        return value
    }

    // Handle Array types: Recursively process each element
    if (baseType === Array || Array.isArray(value)) {
        if (!Array.isArray(value)) {
            errors.push(castError(key, `${key} must be an array`))
            return undefined
        }

        const elementType = meta?.getArrayElementType()
        if (!elementType) return value

        if (meta && !meta.getTypeFn() && isUserDefinedClass(elementType)) {
            return bindElements(elementType, meta, key, value, errors, sources, currentSource, analysis)
        }

        return value.map((element, i) => {
            // Pass the current meta to support polymorphism for array elements
            return typeCasting(elementType, meta, `${key}[${i}]`, element, errors, sources, currentSource, analysis)
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
        // Only a blank string coerces to 0, so the trim check runs only in that case.
        if (isNaN(parsedNumber) || (parsedNumber === 0 && typeof value === 'string' && value.trim() === '')) {
            errors.push(castError(key, `${key} must be a valid number`))
            return undefined
        }
        return parsedNumber
    } else if (targetClass === Boolean) {
        return value === true || value === 'true'
    } else if (targetClass === Date) {
        const parsedDate = new Date(value)
        if (isNaN(parsedDate.getTime())) {
            errors.push(castError(key, `${key} must be a valid date`))
            return undefined
        }
        return parsedDate
    }

    // Recursive binding: Transform nested plain objects into class instances
    if (isUserDefinedClass(targetClass)) {
        if (typeof value !== 'object' || value === null) {
            if (!declaresNestedType(baseType, meta)) return value
            errors.push(castError(key, `${key} must be an object`))
            return value
        }

        const targetAnalysis = analysisOf(targetClass, analysis)
        const errorStart = errors.length
        const bound = bindObject(
            targetClass,
            metadataOf(targetClass, targetAnalysis),
            nestedSources(sources, currentSource, value),
            errors,
            targetAnalysis,
        )
        if (errors.length > errorStart) prefixErrors(errors, errorStart, key)
        return bound
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
): any {
    const targetObject = new objectClass()

    bindRequest(metaClass, targetObject, sources, errors)
    bindSource(metaClass, targetObject, sources, errors, analysis)
    bindVirtual(metaClass, targetObject, errors)

    return targetObject
}

function bindRequest(metaClass: CargoClassMetadata, targetObject: any, sources: BindSources, errors: CargoFieldError[]): void {
    for (const { property, meta } of metaClass.getRequestFieldEntries()) {
        const key = getFieldKey(meta, errors)
        if (!key) continue

        const requestTransformer = meta.getRequestTransformer()

        if (!requestTransformer) {
            errors.push(new CargoTransformFieldError(key, `${key} does not have transformer`))
            continue
        }

        try {
            const value = requestTransformer(sources.req)
            const shouldSkipField = handleMissing(meta, property, key, value, targetObject, errors)

            if (shouldSkipField) {
                continue
            }

            targetObject[property] = value
            validateField(meta, property, key, targetObject, errors)
        } catch (error) {
            errors.push(
                new CargoTransformFieldError(
                    key,
                    `Error while computing request transform field: ${error instanceof Error ? error.message : String(error)}`,
                ),
            )
        }
    }
}

function bindSource(
    metaClass: CargoClassMetadata,
    targetObject: any,
    sources: BindSources,
    errors: CargoFieldError[],
    analysis: AnalysisResult,
): void {
    for (const { property, meta } of metaClass.getFieldEntries()) {
        if (meta.getRequestTransformer()) continue

        const key = getFieldKey(meta, errors)
        if (!key) continue

        const currentSource = meta.getSource()

        // Uploaded files share one map; `@UploadedFile` takes the first entry, `@UploadedFiles` takes them all.
        if (currentSource === 'file' || currentSource === 'files') {
            bindFile(meta, property, key, sources.file?.[key], currentSource === 'files', targetObject, errors)
            continue
        }

        let value
        const currentSourceData = sources[currentSource as keyof BindSources]
        if (currentSourceData) {
            value = currentSourceData[key]
        }

        const shouldSkipField = handleMissing(meta, property, key, value, targetObject, errors)

        if (shouldSkipField) {
            continue
        }

        const castStart = errors.length
        transformSource(meta, property, key, value, targetObject, errors, sources, currentSource, analysis)
        if (errors.length === castStart) {
            validateField(meta, property, key, targetObject, errors)
        } else {
            validateCastField(meta, property, key, targetObject, errors, castStart)
        }
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
): void {
    const value = files && files.length > 0 ? (multiple ? files : files[0]) : undefined

    if (handleMissing(meta, property, key, value, targetObject, errors)) {
        return
    }

    targetObject[property] = value
    validateField(meta, property, key, targetObject, errors)
}

function bindVirtual(metaClass: CargoClassMetadata, targetObject: any, errors: CargoFieldError[]): void {
    for (const { property, meta } of metaClass.getVirtualFieldEntries()) {
        const key = getFieldKey(meta, errors)
        if (!key) continue

        const virtualTransformer = meta.getVirtualTransformer()

        if (!virtualTransformer) {
            errors.push(new CargoTransformFieldError(key, `${key} does not have transformer`))
            continue
        }

        try {
            const value = virtualTransformer(targetObject)
            const shouldSkipField = handleMissing(meta, property, key, value, targetObject, errors)

            if (shouldSkipField) {
                continue
            }

            targetObject[property] = value
            validateField(meta, property, key, targetObject, errors)
        } catch (error) {
            errors.push(
                new CargoTransformFieldError(key, `Error while computing virtual field: ${error instanceof Error ? error.message : String(error)}`),
            )
        }
    }
}
