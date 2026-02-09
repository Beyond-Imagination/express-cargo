import { Source } from './types'
import { CargoClassMetadata } from './metadata'

/**
 * Factory function to create property decorators for request data sourcing.
 * @internal
 */
function createSourceDecorator(source: Source) {
    return (key?: string): PropertyDecorator => {
        return (target: any, propertyKey: string | symbol) => {
            const classMeta = new CargoClassMetadata(target)
            const fieldMeta = classMeta.getFieldMetadata(propertyKey)
            fieldMeta.setKey(key ?? propertyKey)
            fieldMeta.setSource(source)
            classMeta.setFieldMetadata(propertyKey, fieldMeta)
            classMeta.setFieldList(propertyKey)
        }
    }
}

/**
 * Extracts a value from the request body.
 * @param key - Optional field name in the body. Defaults to the property name.
 * @example
 * ```ts
 * class BodyExample {
 *      @Body()
 *      username: string;
 *
 *      @Body('user_age')
 *      age: number;
 * }
 * ```
 */
export const Body = createSourceDecorator('body')

/**
 * Extracts a value from the URL query parameters.
 * @param key - Optional query parameter name. Defaults to the property name.
 * @example
 * ```ts
 * class QueryExample {
 *      @Query('q')
 *      search: string;
 *
 *      @Query()
 *      page: number;
 * }
 * ```
 */
export const Query = createSourceDecorator('query')

/**
 * Extracts a value from the URL path parameters.
 * @param key - Optional path parameter name. Defaults to the property name.
 * @example
 * ```ts
 * class ParamsExample {
 *      @Params('id')
 *      userId: string;
 * }
 * ```
 */
export const Params = createSourceDecorator('params')

/**
 * Alias for `@Params`. Extracts a value from the URL path parameters.
 */
export const Uri = Params

/**
 * Extracts a value from the request headers.
 * @param key - Optional header name. Defaults to the property name.
 * @example
 * ```ts
 * class HeaderExample {
 *      @Header('authorization')
 *      token: string;
 * }
 * ```
 */
export const Header = createSourceDecorator('header')

/**
 * Extracts a value from the session object.
 * @param key - Optional session property key. Defaults to the property name.
 * @example
 * ```ts
 * class SessionExample {
 *      @Session()
 *      userId: string;
 * }
 * ```
 */
export const Session = createSourceDecorator('session')
