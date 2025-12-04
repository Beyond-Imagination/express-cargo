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

export const Body = createSourceDecorator('body')
export const Query = createSourceDecorator('query')
export const Params = createSourceDecorator('params')
export const Uri = Params
export const Header = createSourceDecorator('header')
export const Session = createSourceDecorator('session')
