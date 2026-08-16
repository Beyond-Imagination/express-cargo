import type { CargoClassMetadata } from './metadata'

/**
 * Represents the source of the request data.
 * - `body`: req.body
 * - `query`: req.query
 * - `params`: req.params
 * - `header`: req.headers
 * - `session`: req.session
 * - `file`: one uploaded file, via the configured file locator
 * - `files`: every uploaded file sharing the field name
 */
export type Source = 'body' | 'query' | 'params' | 'header' | 'session' | 'file' | 'files'

/**
 * Represents a class constructor.
 */
export type ClassConstructor<T = any> = new (...args: any[]) => T

export type ValidArrayElementType = typeof String | typeof Number | typeof Boolean | typeof Date | ClassConstructor
export type ArrayElementType = ValidArrayElementType | 'string' | 'number' | 'boolean' | 'date'
export type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'all'
export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512' | 'crc32' | 'crc32b'

/**
 * Options for the `@IsUrl` decorator.
 */
export interface IsUrlOptions {
    /**
     * Allowed protocols. Defaults to `['http', 'https', 'ftp']`.
     */
    protocols?: string[]
}

/**
 * A function that returns a class constructor without any arguments.
 * Used for lazy evaluation of types to handle circular dependencies.
 */
export type TypeThunk = () => ClassConstructor

/**
 * A function that returns a class constructor based on the provided data.
 * Used for polymorphic type resolution.
 */
export type TypeResolver = (data: any) => ClassConstructor

/**
 * Configuration for structural polymorphism using a discriminator field.
 * This allows mapping different classes based on the value of a specific property.
 */
export interface DiscriminatorOptions {
    /**
     * The name of the property to check for the type discriminator.
     * e.g., 'type', 'kind'
     */
    property: string
    /**
     * A list of mappings between discriminator values and their corresponding classes.
     */
    subTypes: {
        /** The class constructor to use when the discriminator matches. */
        value: ClassConstructor
        /** The value of the discriminator property that triggers this class. */
        name: string
    }[]
}

/**
 * Options for the `@Type` decorator.
 */
export interface TypeOptions {
    /**
     * Configuration for handling polymorphism via a discriminator field.
     */
    discriminator?: DiscriminatorOptions
}

/**
 * Custom comparator function for array element comparison.
 * @param expected - The value that is expected to be present in the array.
 * @param actual - The value from the actual array being validated.
 * @returns true if the two values are considered equal, false otherwise.
 */
export type ArrayComparator = (expected: any, actual: any) => boolean

type ErrorMessageFunction = (property: string | symbol, value: any) => string
export type CargoErrorMessage = string | ErrorMessageFunction

export type TypedPropertyDecorator<T> = <K extends string | symbol>(target: { [P in K]?: T }, propertyKey: K) => void

/** Top-level category that classifies what a decorator does. */
export type DecoratorCategory = 'source' | 'request' | 'virtual' | 'transform' | 'missing-handler' | 'type-helper' | 'validator'

/** Whether a decorator tag was applied to the field itself or inside a wrapper like `@Each(...)`. */
export type DecoratorScope = 'self' | 'each'

/** Record of a single decorator application on a field. */
export interface AppliedDecorator {
    name: string
    category: DecoratorCategory
    args: readonly unknown[]
}

/**
 * Result of the class analysis phase.
 * Contains metadata for the root class and all its nested DTOs.
 */
export interface AnalysisResult {
    rootClass: ClassConstructor
    rootMeta: CargoClassMetadata
    metadataMap: Map<ClassConstructor, CargoClassMetadata>
}
