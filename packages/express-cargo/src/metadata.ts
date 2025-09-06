import 'reflect-metadata'
import type { Request } from 'express'
import { Source, ValidatorRule } from './types'

export class CargoClassMetadata {
    private target: any
    private bindingCargoCalled: boolean = false

    constructor(target: any) {
        this.target = target
    }

    getMetadataKey(propertyKey: string | symbol): string {
        return `cargo:${String(propertyKey)}`
    }

    getFieldKey() {
        return `cargo:fields`
    }

    markBindingCargoCalled() {
        this.bindingCargoCalled = true
    }

    getFieldMetadata(propertyKey: string | symbol): CargoFieldMetadata {
        const metadataKey = this.getMetadataKey(propertyKey)
        return Reflect.getMetadata(metadataKey, this.target) || new CargoFieldMetadata(this.target, propertyKey)
    }

    setFieldMetadata(propertyKey: string | symbol, meta: CargoFieldMetadata): void {
        const metaKey = this.getMetadataKey(propertyKey)
        Reflect.defineMetadata(metaKey, meta, this.target)
    }

    getFieldList(): (string | symbol)[] {
        const cacheKey = `cargo:fields:cache`

        if (this.bindingCargoCalled) {
            const cached = Reflect.getMetadata(cacheKey, this.target)
            if (cached) {
                return cached
            }
        }

        const fields = new Set<string | symbol>()
        let current = this.target
        while (current && current !== Object.prototype) {
            const currentFields = Reflect.getMetadata(this.getFieldKey(), current) || []
            currentFields.forEach((f: string | symbol) => fields.add(f))
            current = Object.getPrototypeOf(current)
        }

        const fieldList = Array.from(fields)

        if (this.bindingCargoCalled) {
            Reflect.defineMetadata(cacheKey, fieldList, this.target)
        }

        return fieldList
    }

    setFieldList(propertyKey: string | symbol) {
        const existing = this.getFieldList()
        if (!existing.includes(propertyKey)) {
            Reflect.defineMetadata(this.getFieldKey(), [...existing, propertyKey], this.target)

            const cacheKey = `cargo:fields:cache`
            Reflect.deleteMetadata(cacheKey, this.target)
        }
    }
}

export class CargoFieldMetadata {
    readonly target: any
    readonly type: any
    private key: string | symbol
    private source: Source
    private optional: boolean
    private validators: ValidatorRule[]
    private transformer: ((value: any) => any) | undefined
    private requestTransformer: ((req: Request) => any) | undefined
    private virtualTransformer: ((obj: object) => any) | undefined

    constructor(target: any, key: string | symbol) {
        this.target = target
        this.type = Reflect.getMetadata('design:type', target, key)
        this.key = key
        this.source = 'body'
        this.validators = []
        this.optional = false
        this.transformer = undefined
        this.requestTransformer = undefined
        this.virtualTransformer = undefined
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
}
