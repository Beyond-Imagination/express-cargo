import { bodyKey, FieldMetadata, headerKey, queryKey, sessionKey, SourceKey, uriKey } from './types'

function createSourceDecorator(metadataKey: SourceKey) {
    return (key?: string): PropertyDecorator => {
        return (target, propertyKey) => {
            const existing: FieldMetadata[] = Reflect.getMetadata(metadataKey, target) || []
            existing.push({ property: propertyKey, key: key || propertyKey })
            Reflect.defineMetadata(metadataKey, existing, target)
        }
    }
}

export const body = createSourceDecorator(bodyKey)
export const query = createSourceDecorator(queryKey)
export const uri = createSourceDecorator(uriKey)
export const header = createSourceDecorator(headerKey)
export const session = createSourceDecorator(sessionKey)
