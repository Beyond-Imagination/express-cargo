export const routes = [
    { name: 'express-cargo', prefix: '/express-cargo', sourceClass: 'express-cargo' },
    { name: 'zod', prefix: '/zod', sourceClass: 'zod' },
    { name: 'class-validator+transformer', prefix: '/class-validator', sourceClass: 'class-validator' },
] as const

export type BenchmarkRoute = (typeof routes)[number]

export const SUCCESS_PATH = '/orders/42?active=true'

export const validBody = {
    name: ' Alice ',
    email: 'alice@example.com',
    age: '35',
    role: 'user',
    items: [
        { sku: 'SKU-001', quantity: '2', price: '12.5' },
        { sku: 'SKU-002', quantity: '1', price: '3' },
    ],
}

const invalidBody = {
    name: ' x ',
    email: 'bad',
    age: '17',
    role: 'root',
    items: [{ sku: 'x', quantity: '0', price: '0' }],
}

export const nestedBody = {
    ...validBody,
    items: Array.from({ length: 25 }, (_, index) => ({
        sku: `SKU-${String(index).padStart(3, '0')}`,
        quantity: '2',
        price: '12.5',
    })),
}

export const benchmarkCases = [
    { name: 'valid', path: SUCCESS_PATH, body: validBody, requestId: 'request-123', status: 200 },
    { name: 'validation failure', path: '/orders/0?active=false', body: invalidBody, requestId: 'x', status: 400 },
    { name: 'nested 25 valid', path: SUCCESS_PATH, body: nestedBody, requestId: 'request-123', status: 200 },
] as const

/**
 * Returns the routes in the order given by a comma-separated list of `sourceClass` values,
 * e.g. `zod,express-cargo,class-validator`. Every route must appear exactly once.
 */
export function orderRoutes(order: string | undefined): readonly BenchmarkRoute[] {
    if (order === undefined) return routes
    const names = order.split(',')
    const ordered = names.map(name => routes.find(route => route.sourceClass === name))
    if (ordered.length !== routes.length || new Set(names).size !== routes.length || ordered.some(route => route === undefined)) {
        throw new Error(`--order must list ${routes.map(route => route.sourceClass).join(', ')} once each: ${order}`)
    }
    return ordered as BenchmarkRoute[]
}

/** Reads `--name=value` from the given arguments. */
export function optionValue(argumentsList: readonly string[], name: string): string | undefined {
    const prefix = `--${name}=`
    return argumentsList.find(argument => argument.startsWith(prefix))?.slice(prefix.length)
}
