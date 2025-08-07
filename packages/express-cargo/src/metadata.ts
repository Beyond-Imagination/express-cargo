import 'reflect-metadata'

import { CargoFieldMetadata } from './types'

function getMetadataKey(propertyKey: string | symbol): string {
    return `cargo:${String(propertyKey)}`
}

function getFieldKey() {
    return `cargo:fields`
}

export function getFieldMetadata(target: any, propertyKey: string | symbol): CargoFieldMetadata {
    const metadataKey = getMetadataKey(propertyKey)
    return Reflect.getMetadata(metadataKey, target) || { key: propertyKey, validators: [] }
}

export function setFieldMetadata(target: any, propertyKey: string | symbol, meta: CargoFieldMetadata): void {
    const metaKey = getMetadataKey(propertyKey)
    Reflect.defineMetadata(metaKey, meta, target)
}

export function getFieldList(target: any): (string | symbol)[] {
    const fields = new Set<string | symbol>()
    let current = target

    while (current && current !== Object.prototype) {
        const currentFields = Reflect.getMetadata(getFieldKey(), current) || []
        currentFields.forEach((f: string | symbol) => fields.add(f))
        current = Object.getPrototypeOf(current)
    }

    return Array.from(fields)
}

export function setFieldList(target: any, propertyKey: string | symbol) {
    const existing = getFieldList(target)
    if (!existing.includes(propertyKey)) {
        Reflect.defineMetadata(getFieldKey(), [...existing, propertyKey], target)
    }
}
