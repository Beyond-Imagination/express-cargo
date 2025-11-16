import 'reflect-metadata'
import type { Request } from 'express'
import { ArrayElementType, Source, validArrayElementType, ValidatorRule } from './types'

export class CargoClassMetadata {
    private target: any
    private metadataFinalized: boolean = false

    constructor(target: any) {
        this.target = target
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

    private getCacheKey(metadataKey: string) {
        return `__cache__${metadataKey}`
    }

    markBindingCargoCalled() {
        this.metadataFinalized = true
    }

    getFieldMetadata(propertyKey: string | symbol): CargoFieldMetadata {
        const metadataKey = this.getMetadataKey(propertyKey)
        return Reflect.getMetadata(metadataKey, this.target) || new CargoFieldMetadata(this.target, propertyKey)
    }

    setFieldMetadata(propertyKey: string | symbol, meta: CargoFieldMetadata): void {
        const metaKey = this.getMetadataKey(propertyKey)
        Reflect.defineMetadata(metaKey, meta, this.target)
    }

    private getFieldListByKey(metadataKey: string): (string | symbol)[] {
        if (this.metadataFinalized) {
            const cached = Reflect.getMetadata(this.getCacheKey(metadataKey), this.target)
            if (cached) return cached
        }

        const fields = new Set<string | symbol>()
        let current = this.target
        while (current && current !== Object.prototype) {
            const currentFields = Reflect.getMetadata(metadataKey, current) || []
            currentFields.forEach((f: string | symbol) => fields.add(f))
            current = Object.getPrototypeOf(current)
        }

        const fieldList = Array.from(fields)

        // flag가 true일 때만 캐싱
        if (this.metadataFinalized) {
            Reflect.defineMetadata(this.getCacheKey(metadataKey), fieldList, this.target)
        }

        return fieldList
    }

    private setFieldListByKey(metadataKey: string, propertyKey: string | symbol): void {
        const existing = this.getFieldListByKey(metadataKey)
        if (!existing.includes(propertyKey)) {
            Reflect.defineMetadata(metadataKey, [...existing, propertyKey], this.target)

            if (this.metadataFinalized) {
                Reflect.deleteMetadata(this.getCacheKey(metadataKey), this.target)
            }
        }
    }

    getFieldList(): (string | symbol)[] {
        return this.getFieldListByKey(this.getFieldKey())
    }

    setFieldList(propertyKey: string | symbol): void {
        this.setFieldListByKey(this.getFieldKey(), propertyKey)
    }

    getRequestFieldList(): (string | symbol)[] {
        return this.getFieldListByKey(this.getRequestFieldKey())
    }

    setRequestFieldList(propertyKey: string | symbol): void {
        this.setFieldListByKey(this.getRequestFieldKey(), propertyKey)
    }

    getVirtualFieldList(): (string | symbol)[] {
        return this.getFieldListByKey(this.getVirtualFieldKey())
    }

    setVirtualFieldList(propertyKey: string | symbol): void {
        this.setFieldListByKey(this.getVirtualFieldKey(), propertyKey)
    }
}

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
}
