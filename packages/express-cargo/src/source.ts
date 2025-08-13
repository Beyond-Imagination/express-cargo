import { Source } from './types'
import { CargoClassMetadata } from './metadata'

function createSourceDecorator(source: Source) {
    return (key?: string): PropertyDecorator => {
        return (target, propertyKey) => {
            const classMeta = new CargoClassMetadata(target)
            const fieldMeta = classMeta.getFieldMetadata(propertyKey)
            fieldMeta.setKey(key ?? propertyKey)
            fieldMeta.setSource(source)
            classMeta.setFieldMetadata(propertyKey, fieldMeta)
            classMeta.setFieldList(propertyKey)
        }
    }
}

export const body = createSourceDecorator('body')
export const query = createSourceDecorator('query')
export const uri = createSourceDecorator('uri')
export const header = createSourceDecorator('header')
export const session = createSourceDecorator('session')
