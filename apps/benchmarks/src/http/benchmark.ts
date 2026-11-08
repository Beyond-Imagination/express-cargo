import { deepStrictEqual, strictEqual } from 'node:assert'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { readFileSync, writeFileSync } from 'node:fs'
import { AddressInfo } from 'node:net'
import { cpus, platform, release } from 'node:os'
import { join } from 'node:path'
import { Agent, fetch, setGlobalDispatcher } from 'undici'
import { server } from './app'
import { optionValue, orderRoutes, routes } from '../testcase/common/options'
import { benchmarkCases, validScenario } from '../testcase/scenarios'

const { body: validBody, path: SUCCESS_PATH, response: expectedResponse } = validScenario

type ParityCase = {
    name: string
    path: string
    body: object | string
    requestId: string
    status: number
    response: object
    contentType?: string
}

const invalidExpectation = { status: 400, response: { error: 'invalid request' } }

async function post(
    baseUrl: string,
    path: string,
    body: object | string,
    requestId: string,
    contentType: string = 'application/json',
): Promise<{ status: number; body: unknown; latencyMilliseconds: number }> {
    const requestBody = typeof body === 'string' ? body : JSON.stringify(body)
    const started = performance.now()
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'content-type': contentType,
            'request-id': requestId,
        },
        body: requestBody,
    })
    const responseBody = await response.json()

    return {
        status: response.status,
        body: responseBody,
        latencyMilliseconds: performance.now() - started,
    }
}

async function runConcurrent(count: number, maxConcurrency: number, request: () => Promise<void>): Promise<void> {
    let next = 0
    let failed = false
    await Promise.all(
        Array.from({ length: Math.min(count, maxConcurrency) }, async () => {
            while (next < count && !failed) {
                next++
                try {
                    await request()
                } catch (error) {
                    failed = true
                    throw error
                }
            }
        }),
    )
}

function percentile(sorted: number[], ratio: number): number {
    return sorted[Math.ceil(sorted.length * ratio) - 1]
}

function summarize(scenario: string, implementation: string, implementationLatencies: number[], elapsedMilliseconds: number, maxConcurrency: number) {
    const sorted = [...implementationLatencies].sort((a, b) => a - b)
    const average = implementationLatencies.reduce((sum, value) => sum + value, 0) / implementationLatencies.length
    const rounded = (value: number) => Number(value.toFixed(3))

    return {
        scenario,
        implementation,
        calls: implementationLatencies.length,
        'max concurrency': maxConcurrency,
        'average ms': rounded(average),
        'minimum ms': rounded(sorted[0]),
        'p50 ms': rounded(percentile(sorted, 0.5)),
        'p95 ms': rounded(percentile(sorted, 0.95)),
        'maximum ms': rounded(sorted[sorted.length - 1]),
        'requests/sec': rounded(implementationLatencies.length / (elapsedMilliseconds / 1000)),
    }
}

const RESULT_METRICS = ['calls', 'max concurrency', 'average ms', 'minimum ms', 'p50 ms', 'p95 ms', 'maximum ms', 'requests/sec'] as const

const rotate = <T>(values: readonly T[], offset: number): T[] => [...values.slice(offset % values.length), ...values.slice(0, offset % values.length)]

function medianSummaries(summaries: ReturnType<typeof summarize>[]): ReturnType<typeof summarize>[] {
    return benchmarkCases.flatMap(benchmarkCase =>
        routes.map(route => {
            const samples = summaries.filter(row => row.scenario === benchmarkCase.name && row.implementation === route.name)
            const result = { scenario: benchmarkCase.name, implementation: route.name } as ReturnType<typeof summarize>
            for (const metric of RESULT_METRICS) {
                const values = samples.map(sample => sample[metric]).sort((a, b) => a - b)
                result[metric] = Number(((values[Math.floor((values.length - 1) / 2)] + values[Math.floor(values.length / 2)]) / 2).toFixed(3))
            }
            return result
        }),
    )
}

function renderHtml(resultSummary: string, summaries: ReturnType<typeof summarize>[], metadata: Record<string, unknown> = {}): string {
    const medians = medianSummaries(summaries)
    const tables = benchmarkCases
        .map(benchmarkCase => {
            const rows = new Map(medians.filter(row => row.scenario === benchmarkCase.name).map(row => [row.implementation, row]))
            return `<section><h2>${benchmarkCase.name}</h2><table><thead><tr><th scope="col">metric</th>${routes
                .map(route => `<th scope="col" class="source source-${route.sourceClass}">${route.name}</th>`)
                .join('')}</tr></thead><tbody>${RESULT_METRICS.map(metric => {
                const measurements = routes.map(route => ({ route, value: rows.get(route.name)![metric] }))
                const values = measurements.map(measurement => measurement.value)
                const best =
                    metric === 'requests/sec'
                        ? Math.max(...values)
                        : metric === 'calls' || metric === 'max concurrency'
                          ? undefined
                          : Math.min(...values)
                return `<tr><th scope="row">${metric}</th>${measurements
                    .map(
                        ({ route, value }) =>
                            `<td class="source source-${route.sourceClass}${value === best ? ' best' : ''}" title="${route.name} · ${metric}">${value}</td>`,
                    )
                    .join('')}</tr>`
            }).join('')}</tbody></table></section>`
        })
        .join('')

    const reportData = JSON.stringify({ metadata, medians, rounds: summaries }).replace(/</g, '\\u003c')
    const environment = JSON.stringify(metadata, null, 2).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Benchmark results</title><style>body{font-family:system-ui,sans-serif;margin:2rem}table{border-collapse:collapse;margin-bottom:2rem}th,td{border:1px solid #ccc;padding:.5rem;text-align:right}th:first-child{text-align:left}.source-express-cargo{--source-color:#2563eb;--source-bg:#eff6ff}.source-zod{--source-color:#7c3aed;--source-bg:#f5f3ff}.source-class-validator{--source-color:#ea580c;--source-bg:#fff7ed}th.source,td.source{background:var(--source-bg)}th.source{color:var(--source-color)}td.source{border-left:3px solid var(--source-color)}td.best{background:#d1fae5;color:#065f46;font-weight:700}</style></head><body><main><h1>Benchmark results</h1><p>${resultSummary}</p>${tables}<details><summary>Environment and methodology</summary><pre>${environment}</pre></details><script id="benchmark-data" type="application/json">${reportData}</script></main></body></html>\n`
}

async function main(): Promise<void> {
    const arguments_ = process.argv.slice(2).filter(argument => argument !== '--')
    const checkOnly = arguments_.includes('--check')
    // --order=<sourceClass,...> fixes the measurement order (otherwise each round rotates it); --json=<file> also saves the summaries as JSON.
    const fixedOrder = optionValue(arguments_, 'order')
    const measuredRoutes = orderRoutes(fixedOrder)
    const jsonFileName = optionValue(arguments_, 'json')
    const positionalArguments = arguments_.filter(argument => !argument.startsWith('--'))
    const [callsArgument, maxConcurrencyArgument, roundsArgument] = positionalArguments
    const calls = Number(callsArgument ?? 1000)
    const maxConcurrency = Number(maxConcurrencyArgument ?? 1000)
    const rounds = Number(roundsArgument ?? 3)
    if (!Number.isInteger(calls) || calls < 1) throw new Error(`Calls per API must be a positive integer: ${callsArgument}`)
    if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
        throw new Error(`Maximum concurrency must be a positive integer: ${maxConcurrencyArgument}`)
    }
    if (!Number.isInteger(rounds) || rounds < 1) throw new Error(`Rounds must be a positive integer: ${roundsArgument}`)

    const connectionCount = Math.min(maxConcurrency, 100)
    // ponytail: stay below macOS's default TCP backlog; pipelining preserves the requested in-flight concurrency.
    const dispatcher = new Agent({ connections: connectionCount, pipelining: Math.ceil(maxConcurrency / connectionCount) })
    setGlobalDispatcher(dispatcher)
    try {
        await once(server, 'listening')
        const { port } = server.address() as AddressInfo
        const baseUrl = `http://127.0.0.1:${port}`

        const malformedScalarBodies = [
            { name: 'name array', body: { ...validBody, name: ['Alice'] } },
            { name: 'email array', body: { ...validBody, email: ['a@b'] } },
            { name: 'age array', body: { ...validBody, age: ['35'] } },
            { name: 'null scalar', body: { ...validBody, name: null } },
            { name: 'SKU array', body: { ...validBody, items: [{ ...validBody.items[0], sku: ['SKU-001'] }] } },
            { name: 'quantity array', body: { ...validBody, items: [{ ...validBody.items[0], quantity: ['2'] }] } },
            { name: 'price array', body: { ...validBody, items: [{ ...validBody.items[0], price: ['12.5'] }] } },
        ]
        const parityCases: ParityCase[] = [
            ...benchmarkCases,
            ...Object.keys(validBody).map(field => ({
                ...benchmarkCases[0],
                name: `missing body ${field}`,
                body: Object.fromEntries(Object.entries(validBody).filter(([key]) => key !== field)),
                ...invalidExpectation,
            })),
            ...[
                { name: 'age below minimum', body: { ...validBody, age: '17' } },
                { name: 'age above maximum', body: { ...validBody, age: '121' } },
                { name: 'short trimmed name', body: { ...validBody, name: ' ab ' } },
                { name: 'long name', body: { ...validBody, name: 'a'.repeat(51) } },
                { name: 'empty item list', body: { ...validBody, items: [] } },
                { name: 'quantity below minimum', body: { ...validBody, items: [{ ...validBody.items[0], quantity: '0' }] } },
                { name: 'price below minimum', body: { ...validBody, items: [{ ...validBody.items[0], price: '0.009' }] } },
                { name: 'infinite quantity', body: { ...validBody, items: [{ ...validBody.items[0], quantity: 'Infinity' }] } },
                { name: 'infinite price', body: { ...validBody, items: [{ ...validBody.items[0], price: 'Infinity' }] } },
                { name: 'NaN age', body: { ...validBody, age: 'NaN' } },
            ].map(({ name, body }) => ({ ...benchmarkCases[0], name, body, ...invalidExpectation })),
            {
                ...benchmarkCases[0],
                name: 'minimum boundaries',
                body: { ...validBody, name: 'abc', age: '18', role: 'admin', items: [{ sku: 'abc', quantity: '1', price: '0.01' }] },
                response: { ...expectedResponse, name: 'abc', age: 18, role: 'admin', itemCount: 1, total: 0.01 },
            },
            {
                ...benchmarkCases[0],
                name: 'maximum boundaries',
                body: { ...validBody, name: 'a'.repeat(50), age: '120' },
                response: { ...expectedResponse, name: 'a'.repeat(50), age: 120 },
            },
            {
                name: 'missing query field',
                path: '/valid/orders/42',
                body: validBody,
                requestId: 'request-123',
                ...invalidExpectation,
            },
            {
                name: 'repeated query field',
                path: '/valid/orders/42?active=true&active=false',
                body: validBody,
                requestId: 'request-123',
                ...invalidExpectation,
            },
            {
                name: 'bracketed query field',
                path: '/valid/orders/42?active[]=true',
                body: validBody,
                requestId: 'request-123',
                ...invalidExpectation,
            },
            {
                name: 'coerced string',
                path: SUCCESS_PATH,
                body: { ...validBody, name: 12345 },
                requestId: 'request-123',
                status: 200,
                response: { ...expectedResponse, name: '12345' },
            },
            {
                name: 'email boundary',
                path: SUCCESS_PATH,
                body: { ...validBody, email: 'a@b' },
                requestId: 'request-123',
                status: 200,
                response: { ...expectedResponse, email: 'a@b' },
            },
            {
                name: 'Unicode name minimum',
                path: SUCCESS_PATH,
                body: { ...validBody, name: 'a😀' },
                requestId: 'request-123',
                status: 200,
                response: { ...expectedResponse, name: 'a😀' },
            },
            {
                name: 'Unicode name maximum',
                path: SUCCESS_PATH,
                body: { ...validBody, name: `${'😀'.repeat(25)}a` },
                requestId: 'request-123',
                ...invalidExpectation,
            },
            {
                name: 'Unicode SKU minimum',
                path: SUCCESS_PATH,
                body: { ...validBody, items: [{ ...validBody.items[0], sku: 'a😀' }, validBody.items[1]] },
                requestId: 'request-123',
                status: 200,
                response: expectedResponse,
            },
            {
                name: 'Unicode SKU below minimum',
                path: SUCCESS_PATH,
                body: { ...validBody, items: [{ ...validBody.items[0], sku: '😀' }, validBody.items[1]] },
                requestId: 'request-123',
                ...invalidExpectation,
            },
            {
                name: 'non-finite number',
                path: '/valid/orders/Infinity?active=true',
                body: validBody,
                requestId: 'request-123',
                ...invalidExpectation,
            },
            {
                name: 'null nested item',
                path: SUCCESS_PATH,
                body: { ...validBody, items: [null] },
                requestId: 'request-123',
                ...invalidExpectation,
            },
            {
                name: 'primitive nested item',
                path: SUCCESS_PATH,
                body: { ...validBody, items: [1] },
                requestId: 'request-123',
                ...invalidExpectation,
            },
            {
                name: 'nested array item',
                path: SUCCESS_PATH,
                body: { ...validBody, items: [[]] },
                requestId: 'request-123',
                ...invalidExpectation,
            },
            {
                name: 'arithmetic overflow',
                path: SUCCESS_PATH,
                body: { ...validBody, items: [{ sku: 'SKU-001', quantity: '1e308', price: '1e308' }] },
                requestId: 'request-123',
                ...invalidExpectation,
            },
            {
                name: 'malformed JSON',
                path: SUCCESS_PATH,
                body: '{',
                requestId: 'request-123',
                ...invalidExpectation,
            },
            ...malformedScalarBodies.map(({ name, body }) => ({
                name,
                path: SUCCESS_PATH,
                body,
                requestId: 'request-123',
                ...invalidExpectation,
            })),
            {
                name: 'oversized JSON',
                path: SUCCESS_PATH,
                body: JSON.stringify({ ...validBody, name: 'a'.repeat(110_000) }),
                requestId: 'request-123',
                status: 413,
                response: { error: 'invalid request' },
            },
            {
                name: 'unsupported JSON charset',
                path: SUCCESS_PATH,
                body: JSON.stringify(validBody),
                requestId: 'request-123',
                status: 415,
                response: { error: 'invalid request' },
                contentType: 'application/json; charset=iso-8859-1',
            },
        ]

        for (const parityCase of parityCases) {
            for (const route of routes) {
                const result = await post(baseUrl, `${route.prefix}${parityCase.path}`, parityCase.body, parityCase.requestId, parityCase.contentType)
                strictEqual(result.status, parityCase.status, `${route.name}: ${parityCase.name}`)
                deepStrictEqual(result.body, parityCase.response, `${route.name}: ${parityCase.name}`)
            }
        }

        if (checkOnly) {
            let active = 0
            let peak = 0
            await runConcurrent(3, 2, async () => {
                active++
                peak = Math.max(peak, active)
                await new Promise(resolve => setTimeout(resolve, 0))
                active--
            })
            strictEqual(peak, 2)
            const html = renderHtml(
                'check',
                benchmarkCases.flatMap(benchmarkCase =>
                    routes.map((route, index) => summarize(benchmarkCase.name, route.name, [index + 1], index + 1, 1)),
                ),
            )
            for (const route of routes) strictEqual(html.includes(`title="${route.name} · average ms"`), true)
            strictEqual(html.includes('class="source source-express-cargo best" title="express-cargo · requests/sec"'), true)
            deepStrictEqual(
                orderRoutes('zod,class-validator,express-cargo').map(route => route.name),
                ['zod', 'class-validator+transformer', 'express-cargo'],
            )
            const repeatedHtml = renderHtml(
                'round medians',
                [3, 1, 7].flatMap(latency =>
                    benchmarkCases.flatMap(benchmarkCase =>
                        routes.map((route, index) => ({
                            round: 1,
                            ...summarize(benchmarkCase.name, route.name, [latency + index], latency + index, 1),
                        })),
                    ),
                ),
            )
            strictEqual(repeatedHtml.includes('title="express-cargo · average ms">3</td>'), true, 'report the round median, not the last round')
            const repeatedData = JSON.parse(repeatedHtml.match(/<script id="benchmark-data" type="application\/json">(.*?)<\/script>/)![1])
            strictEqual('round' in repeatedData.medians[0], false, 'a median must not be labeled as one individual round')
            deepStrictEqual(
                rotate(routes, 1).map(route => route.name),
                ['zod', 'class-validator+transformer', 'express-cargo'],
            )
            deepStrictEqual(
                rotate(routes, 2).map(route => route.name),
                ['class-validator+transformer', 'express-cargo', 'zod'],
            )
            strictEqual(html.includes('td.best{background:'), true, 'winner background must override the source background')
            console.log(`Validated ${parityCases.length} shared request/response cases.`)
            return
        }

        const warmupCalls = Math.min(calls, Math.max(1000, maxConcurrency))
        const serializedCases = benchmarkCases.map(benchmarkCase => ({ ...benchmarkCase, body: JSON.stringify(benchmarkCase.body) }))
        const combinations = serializedCases.flatMap(benchmarkCase => measuredRoutes.map(route => ({ benchmarkCase, route })))
        const summaries: (ReturnType<typeof summarize> & { round: number })[] = []
        for (const { benchmarkCase, route } of combinations) {
            await runConcurrent(warmupCalls, maxConcurrency, async () => {
                const response = await post(baseUrl, `${route.prefix}${benchmarkCase.path}`, benchmarkCase.body, benchmarkCase.requestId)
                strictEqual(response.status, benchmarkCase.status)
            })
        }

        for (let round = 0; round < rounds; round++) {
            const roundRoutes = fixedOrder === undefined ? rotate(measuredRoutes, round) : measuredRoutes
            const order = rotate(serializedCases, round).flatMap(benchmarkCase => roundRoutes.map(route => ({ benchmarkCase, route })))
            for (const { benchmarkCase, route } of order) {
                const implementationLatencies: number[] = []
                const started = performance.now()
                await runConcurrent(calls, maxConcurrency, async () => {
                    const response = await post(baseUrl, `${route.prefix}${benchmarkCase.path}`, benchmarkCase.body, benchmarkCase.requestId)
                    strictEqual(response.status, benchmarkCase.status)
                    implementationLatencies.push(response.latencyMilliseconds)
                })
                strictEqual(implementationLatencies.length, calls)
                const summary = {
                    round: round + 1,
                    ...summarize(benchmarkCase.name, route.name, implementationLatencies, performance.now() - started, maxConcurrency),
                }
                summaries.push(summary)
                console.log(`Round ${round + 1}/${rounds}: ${benchmarkCase.name} / ${route.name}: ${summary['requests/sec']} requests/sec`)
            }
        }

        const routeOrder = measuredRoutes.map(route => route.name)
        const orderDescription =
            fixedOrder === undefined
                ? `route order rotated each round, starting from ${routeOrder.join(' → ')}`
                : `fixed route order ${routeOrder.join(' → ')}`
        const resultSummary = `Validated ${parityCases.length} shared request/response cases. ${calls} calls per API/scenario/round, ${rounds} rounds (${orderDescription}), maximum concurrency ${maxConcurrency}, ${warmupCalls} warm-up calls per API/scenario. Tables show the median of each round statistic (not pooled percentiles). HTTP loopback includes client and server in one process, JSON parsing, binding/validation and the shared response; it is not a validator-only microbenchmark.`
        console.log(resultSummary)
        console.table(medianSummaries(summaries))

        const metadata = {
            measuredAt: new Date().toISOString(),
            commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
            cargoArtifact: require.resolve('express-cargo'),
            runtime: process.version,
            architecture: process.arch,
            os: `${platform()} ${release()}`,
            cpu: cpus()[0].model,
            versions: Object.fromEntries(
                ['express-cargo', 'zod', 'class-validator', 'class-transformer', 'express', 'undici'].map(name => [
                    name,
                    JSON.parse(readFileSync(join(__dirname, '../../../node_modules', name, 'package.json'), 'utf8')).version,
                ]),
            ),
            callsPerRound: calls,
            rounds,
            measuredRequests: calls * rounds * combinations.length,
            maxConcurrency,
            connections: connectionCount,
            warmupCalls,
            parityCases: parityCases.length,
            workingDirectory: process.cwd(),
            buildCommand: 'pnpm --filter benchmarks build',
            command: `node dist/src/http/benchmark.js ${calls} ${maxConcurrency} ${rounds}${fixedOrder === undefined ? '' : ` --order=${fixedOrder}`}`,
            harnessHashes: Object.fromEntries(
                [
                    'src/http/app.ts',
                    'src/testcase/common/types.ts',
                    'src/testcase/common/options.ts',
                    'src/testcase/scenarios/valid.ts',
                    'src/testcase/scenarios/validationFailure.ts',
                    'src/testcase/scenarios/nested25.ts',
                    'src/testcase/scenarios/patterns.ts',
                    'src/testcase/libraries/express-cargo/routes.ts',
                    'src/testcase/libraries/express-cargo/types.ts',
                    'src/testcase/libraries/zod/routes.ts',
                    'src/testcase/libraries/zod/types.ts',
                    'src/testcase/libraries/class-validator/routes.ts',
                    'src/testcase/libraries/class-validator/types.ts',
                    'src/http/benchmark.ts',
                    'package.json',
                ].map(file => [
                    file,
                    createHash('sha256')
                        .update(readFileSync(join(__dirname, '../../..', file)))
                        .digest('hex'),
                ]),
            ),
        }

        if (jsonFileName !== undefined) {
            // `summaries` holds one median row per scenario/implementation (what order-sweep and compare read); `roundSummaries` keeps every round.
            writeFileSync(
                jsonFileName,
                `${JSON.stringify({ calls, maxConcurrency, warmupCalls, rounds, routeOrder, summaries: medianSummaries(summaries), roundSummaries: summaries }, null, 2)}\n`,
            )
            console.log(`Saved ${jsonFileName}`)
        }

        const resultFileName =
            jsonFileName !== undefined
                ? `${jsonFileName.replace(/\.json$/i, '')}.html`
                : `benchmark-results-${new Date().toISOString().replace(/[:.]/g, '-')}.html`
        writeFileSync(resultFileName, renderHtml(resultSummary, summaries, metadata))
        console.log(`Saved ${resultFileName}`)
    } finally {
        await dispatcher.close()
        // A server that failed to listen (port already in use) has nothing to close; closing it would hide that error.
        if (server.listening) {
            server.closeAllConnections()
            await new Promise<void>((resolve, reject) => server.close(error => (error ? reject(error) : resolve())))
        }
    }
}

main().catch(error => {
    console.error(error)
    // Importing ./app starts the server, and an error outside main's cleanup would leave it keeping the process alive.
    process.exit(1)
})
