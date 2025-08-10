import 'reflect-metadata'

import { Source, ValidatorRule } from './types'

export class CargoClassMetadata {
    private target: any

    constructor(target: any) {
        this.target = target
    }

    getMetadataKey(propertyKey: string | symbol): string {
        return `cargo:${String(propertyKey)}`
    }

    getFieldKey() {
        return `cargo:fields`
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
        return Reflect.getMetadata(this.getFieldKey(), this.target) || []
    }

    setFieldList(propertyKey: string | symbol) {
        const existing = this.getFieldList()
        if (!existing.includes(propertyKey)) {
            Reflect.defineMetadata(this.getFieldKey(), [...existing, propertyKey], this.target)
        }
    }
}

export class CargoFieldMetadata {
    readonly target: any
    private key: string | symbol
    private source: Source
    private validators: ValidatorRule[]
    private optional: boolean
    private type: new () => any

    constructor(target: any, key: string | symbol) {
        this.target = target
        this.key = key
        this.source = 'body'
        this.validators = []
        this.optional = false
        this.type = Reflect.getMetadata('design:type', target.prototype, key)
        console.log(this)
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

    getType(): new () => any {
        return this.type
    }
}
