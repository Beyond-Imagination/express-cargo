import 'reflect-metadata'
import type { Request } from 'express'
import {
    AppliedDecorator,
    DecoratorScope,
    ResolvedFieldLists,
    Source,
    TypeOptions,
    TypeResolver,
    TypeThunk,
    validArrayElementType,
    ValidatorRule,
} from './types'

/**
 * Manages metadata for a cargo class.
 * Handles field registration and retrieval; call {@link CargoClassMetadata.resolve}
 * to precompute the merged field lists once decoration is complete.
 */
export class CargoClassMetadata {
    private resolved?: ResolvedFieldLists

    constructor(private target: any) {}

    /**
     * Precomputes every merged field list once and stores the result on this instance.
     *
     * Call this after decoration is complete (i.e. during {@link analyzeCargoSchema}); from then on
     * the read accessors return the precomputed lists instead of walking the prototype chain.
     * Because the schema is frozen by analysis time, no cache invalidation is needed.
     */
    resolve(): this {
        this.resolved = {
            fields: this.getFieldListByKey(this.getFieldKey()),
            requestFields: this.getFieldListByKey(this.getRequestFieldKey()),
            virtualFields: this.getFieldListByKey(this.getVirtualFieldKey()),
            allFields: this.getFieldListByKey(this.getAllFieldsKey()),
        }
        return this
    }

    getMetadataKey(propertyKey: string | symbol): string {
        return `cargo:${String(propertyKey)}`
    }

    getFieldKey(): string {
        return `cargo:fields`
    }

    getRequestFieldKey(): string {
        return 'cargo:requestFields'
    }

    getVirtualFieldKey(): string {
        return 'cargo:virtualFields'
    }

    getAllFieldsKey(): string {
        return 'cargo:allFields'
    }

    getFieldMetadata(propertyKey: string | symbol): CargoFieldMetadata {
        const metadataKey = this.getMetadataKey(propertyKey)
        return Reflect.getMetadata(metadataKey, this.target) || new CargoFieldMetadata(this.target, propertyKey)
    }

    setFieldMetadata(propertyKey: string | symbol, meta: CargoFieldMetadata): void {
        const metaKey = this.getMetadataKey(propertyKey)
        Reflect.defineMetadata(metaKey, meta, this.target)
        this.setFieldListByKey(this.getAllFieldsKey(), propertyKey)
    }

    private getFieldListByKey(metadataKey: string): (string | symbol)[] {
        const fields = new Set<string | symbol>()
        let current = this.target
        while (current && current !== Object.prototype) {
            const currentFields = Reflect.getMetadata(metadataKey, current) || []
            currentFields.forEach((f: string | symbol) => fields.add(f))
            current = Object.getPrototypeOf(current)
        }

        return Array.from(fields)
    }

    private setFieldListByKey(metadataKey: string, propertyKey: string | symbol): void {
        const existing = this.getFieldListByKey(metadataKey)
        if (!existing.includes(propertyKey)) {
            Reflect.defineMetadata(metadataKey, [...existing, propertyKey], this.target)
        }
    }

    getFieldList(): (string | symbol)[] {
        return this.resolved?.fields ?? this.getFieldListByKey(this.getFieldKey())
    }

    setFieldList(propertyKey: string | symbol): void {
        this.setFieldListByKey(this.getFieldKey(), propertyKey)
    }

    getRequestFieldList(): (string | symbol)[] {
        return this.resolved?.requestFields ?? this.getFieldListByKey(this.getRequestFieldKey())
    }

    setRequestFieldList(propertyKey: string | symbol): void {
        this.setFieldListByKey(this.getRequestFieldKey(), propertyKey)
    }

    getVirtualFieldList(): (string | symbol)[] {
        return this.resolved?.virtualFields ?? this.getFieldListByKey(this.getVirtualFieldKey())
    }

    setVirtualFieldList(propertyKey: string | symbol): void {
        this.setFieldListByKey(this.getVirtualFieldKey(), propertyKey)
    }

    getAllFieldsList(): (string | symbol)[] {
        return this.resolved?.allFields ?? this.getFieldListByKey(this.getAllFieldsKey())
    }
}

/**
 * Stores metadata for a specific field in a cargo class.
 * Contains information about source, validation rules, transformers, and type information.
 */
export class CargoFieldMetadata {
    readonly target: any
    readonly type: any
    private key: string | symbol
    private source: Source
    private optional: boolean
    private defaultValue: any
    private arrayElementType: validArrayElementType | undefined
    private validators: ValidatorRule[]
    private transformer: ((value: any) => any) | undefined
    private requestTransformer: ((req: Request) => any) | undefined
    private virtualTransformer: ((obj: object) => any) | undefined
    private enumType: object | undefined
    private typeFn: TypeThunk | TypeResolver | undefined
    private typeOptions: TypeOptions | undefined
    private readonly decoratorTags: { scope: DecoratorScope; tag: AppliedDecorator }[]

    constructor(target: any, key: string | symbol) {
        this.target = target
        this.type = Reflect.getMetadata('design:type', target, key)
        this.key = key
        this.source = 'body'
        this.validators = []
        this.optional = false
        this.defaultValue = undefined
        this.transformer = undefined
        this.requestTransformer = undefined
        this.virtualTransformer = undefined
        this.enumType = undefined
        this.decoratorTags = []
    }

    getKey(): string | symbol {
        return this.key
    }

    setKey(key: string | symbol) {
        this.key = key
    }

    getSource(): Source {
        return this.source
    }

    setSource(source: Source): void {
        this.source = source
    }

    getValidators(): ValidatorRule[] {
        return this.validators
    }

    addValidator(rule: ValidatorRule): void {
        this.validators.push(rule)
    }

    getOptional(): boolean {
        return this.optional
    }

    setOptional(optional: boolean): void {
        this.optional = optional
    }

    getDefault(): any {
        return this.defaultValue
    }

    setDefault(defaultValue: any): void {
        this.defaultValue = defaultValue
    }

    getArrayElementType(): validArrayElementType | undefined {
        return this.arrayElementType
    }

    setArrayElementType(arrayElementType: validArrayElementType): void {
        this.arrayElementType = arrayElementType
    }

    getTransformer(): ((value: any) => any) | undefined {
        return this.transformer
    }

    setTransformer(transformer: (value: any) => any): void {
        this.transformer = transformer
    }

    getRequestTransformer(): ((req: Request) => any) | undefined {
        return this.requestTransformer
    }

    setRequestTransformer(transformer: (req: Request) => any): void {
        this.requestTransformer = transformer
    }

    getVirtualTransformer(): ((...value: any[]) => any) | undefined {
        return this.virtualTransformer
    }

    setVirtualTransformer(transformer: (...value: any[]) => any): void {
        this.virtualTransformer = transformer
    }

    setEnumType(enumType: object): void {
        this.enumType = enumType
    }

    getEnumType(): object | undefined {
        return this.enumType
    }

    setTypeInfo(fn: TypeThunk | TypeResolver, options?: TypeOptions): void {
        this.typeFn = fn
        this.typeOptions = options
    }

    getTypeFn(): TypeThunk | TypeResolver | undefined {
        return this.typeFn
    }

    getTypeOptions(): TypeOptions | undefined {
        return this.typeOptions
    }

    /**
     * Records that a decorator has been applied to this field.
     *
     * Entries are accumulated (not overwritten) so that rule checkers can spot
     * repeated applications of the same decorator.
     *
     * The `scope` distinguishes decorators applied directly to the field (`'self'`) from those passed as
     * arguments to a wrapping decorator like `@Each(...)` (`'each'`); without this split,
     * `@Body() @Each(Body())` would look like two source decorators on the same field.
     */
    pushAppliedDecorator(tag: AppliedDecorator, scope: DecoratorScope = 'self'): void {
        this.decoratorTags.push({ scope, tag })
    }

    getAppliedDecorators(scope: DecoratorScope = 'self'): readonly AppliedDecorator[] {
        return this.decoratorTags.filter(entry => entry.scope === scope).map(entry => entry.tag)
    }
}
