export const routes = [
    { name: 'express-cargo', prefix: '/express-cargo', sourceClass: 'express-cargo' },
    { name: 'zod', prefix: '/zod', sourceClass: 'zod' },
    { name: 'class-validator+transformer', prefix: '/class-validator', sourceClass: 'class-validator' },
] as const

export type BenchmarkRoute = (typeof routes)[number]

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
