import { CargoFieldMetadata } from './types'

function getMetadataKey(propertyKey: string | symbol): string {
    return `cargo:${String(propertyKey)}`
}

export function getFieldMetadata(target: any, propertyKey: string | symbol): CargoFieldMetadata {
    const metadataKey = getMetadataKey(propertyKey)
    return Reflect.getMetadata(metadataKey, target) || { key: propertyKey, validators: [] }
}

export function setFieldMetadata(target: any, propertyKey: string | symbol, meta: CargoFieldMetadata): void {
    const metaKey = getMetadataKey(propertyKey)
    Reflect.defineMetadata(metaKey, meta, target)
}
