import { Source } from './types'
import { setFieldList, getFieldMetadata, setFieldMetadata } from './metadata'

function createSourceDecorator(source: Source) {
    return (key?: string): PropertyDecorator => {
        return (target, propertyKey) => {
            const meta = getFieldMetadata(target, propertyKey)
            meta.source = source
            meta.key = key ?? propertyKey
            setFieldMetadata(target, propertyKey, meta)
            setFieldList(target, propertyKey)
        }
    }
}

export const body = createSourceDecorator('body')
export const query = createSourceDecorator('query')
export const uri = createSourceDecorator('uri')
export const header = createSourceDecorator('header')
export const session = createSourceDecorator('session')
