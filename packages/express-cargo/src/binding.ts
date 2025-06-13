type Source = 'body' | 'query' | 'uri' | 'header' | 'session'

type FieldMetadata = {
    property: string | symbol
    key: string | symbol
}

function createSourceDecorator(source: Source) {
    return (key?: string): PropertyDecorator => {
        return (target, propertyKey) => {
            const metaKey = `cargo:${source}`
            const existing: FieldMetadata[] = Reflect.getMetadata(metaKey, target) || []
            existing.push({ property: propertyKey, key: key || propertyKey })
            Reflect.defineMetadata(metaKey, existing, target)
        }
    }
}

export const body = createSourceDecorator('body')
export const query = createSourceDecorator('query')
export const uri = createSourceDecorator('uri')
export const header = createSourceDecorator('header')
export const session = createSourceDecorator('session')
