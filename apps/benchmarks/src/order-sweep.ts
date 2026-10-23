import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { HttpRun, median, range } from './results'
import { benchmarkCases, routes } from './scenarios'

// Runs the HTTP benchmark once per route order (every permutation), to show how much the
// measurement position moves each implementation's throughput. Even rounds run the orders in reverse.

function permutations<T>(items: readonly T[]): T[][] {
    if (items.length <= 1) return [[...items]]
    return items.flatMap((item, index) => permutations([...items.slice(0, index), ...items.slice(index + 1)]).map(rest => [item, ...rest]))
}

function main(): void {
    const [roundsArgument, callsArgument, maxConcurrencyArgument] = process.argv.slice(2).filter(argument => !argument.startsWith('--'))
    const rounds = Number(roundsArgument ?? 2)
    if (!Number.isInteger(rounds) || rounds < 1) throw new Error(`Rounds must be a positive integer: ${roundsArgument}`)

    const orders = permutations(routes.map(route => route.sourceClass))
    const outputDirectory = `benchmark-results-order-${new Date().toISOString().replace(/[:.]/g, '-')}`
    mkdirSync(outputDirectory)

    const runs: { order: string; round: number; run: HttpRun }[] = []
    for (let round = 1; round <= rounds; round++) {
        for (const order of round % 2 === 1 ? orders : [...orders].reverse()) {
            const orderOption = order.join(',')
            console.log(`\n[round ${round}/${rounds}] route order ${orderOption}`)
            const file = join(outputDirectory, `${order.join('_')}-r${round}.json`)
            execFileSync(
                process.execPath,
                [
                    join(__dirname, 'benchmark.js'),
                    callsArgument ?? '20000',
                    maxConcurrencyArgument ?? '1000',
                    `--order=${orderOption}`,
                    `--json=${file}`,
                ],
                { stdio: 'inherit' },
            )
            runs.push({ order: orderOption, round, run: JSON.parse(readFileSync(file, 'utf8')) })
        }
    }

    const requestsPerSecond = (run: HttpRun, scenario: string, implementation: string) =>
        run.summaries.find(row => row.scenario === scenario && row.implementation === implementation)!['requests/sec']

    // Ratio of the first route to the second (express-cargo ÷ zod) within the same run, per order and round.
    const [numerator, denominator] = routes
    const ratioRows = orders.map(order => {
        const orderOption = order.join(',')
        const orderRuns = runs.filter(entry => entry.order === orderOption)
        return {
            order: order.join(' → '),
            ...Object.fromEntries(
                benchmarkCases.map(({ name }) => [
                    name,
                    orderRuns
                        .map(({ run }) => (requestsPerSecond(run, name, numerator.name) / requestsPerSecond(run, name, denominator.name)).toFixed(3))
                        .join(' / '),
                ]),
            ),
        }
    })

    const positionRows = benchmarkCases.flatMap(({ name }) =>
        routes.map(route => ({
            scenario: name,
            implementation: route.name,
            ...Object.fromEntries(
                routes.map((_, position) => {
                    const values = runs
                        .filter(({ run }) => run.routeOrder.indexOf(route.name) === position)
                        .map(({ run }) => requestsPerSecond(run, name, route.name))
                    return [`position ${position + 1}`, `${Math.round(median(values))} (${range(values)})`]
                }),
            ),
        })),
    )

    console.log(`\n${numerator.name} ÷ ${denominator.name} req/s per route order (round 1 / round 2 / ...)`)
    console.table(ratioRows)
    console.log('Median req/s by measurement position (minimum–maximum)')
    console.table(positionRows)
    writeFileSync(join(outputDirectory, 'summary.json'), `${JSON.stringify({ ratioRows, positionRows }, null, 2)}\n`)
    console.log(`Saved ${outputDirectory}`)
}

main()
