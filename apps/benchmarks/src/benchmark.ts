import { deepStrictEqual, strictEqual } from 'node:assert'
import { once } from 'node:events'
import { writeFileSync } from 'node:fs'
import { AddressInfo } from 'node:net'
import { Agent, fetch, setGlobalDispatcher } from 'undici'
import { app } from './app'

const routes = [
    { name: 'express-cargo', prefix: '/express-cargo', sourceClass: 'express-cargo' },
    { name: 'zod', prefix: '/zod', sourceClass: 'zod' },
    { name: 'class-validator+transformer', prefix: '/class-validator', sourceClass: 'class-validator' },
] as const

const SUCCESS_PATH = '/orders/42?active=true'

const validBody = {
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

const nestedBody = {
    ...validBody,
    items: Array.from({ length: 25 }, (_, index) => ({
        sku: `SKU-${String(index).padStart(3, '0')}`,
        quantity: '2',
        price: '12.5',
    })),
}

const expectedResponse = {
    id: 42,
    active: true,
    requestId: 'request-123',
    name: 'Alice',
    email: 'alice@example.com',
    age: 35,
    role: 'user',
    itemCount: 2,
    total: 28,
}

const nestedExpectedResponse = {
    ...expectedResponse,
    itemCount: nestedBody.items.length,
    total: nestedBody.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0),
}

const benchmarkCases = [
    { name: 'valid', path: SUCCESS_PATH, body: validBody, requestId: 'request-123', status: 200 },
    { name: 'validation failure', path: '/orders/0?active=false', body: invalidBody, requestId: 'x', status: 400 },
    { name: 'nested 25 valid', path: SUCCESS_PATH, body: nestedBody, requestId: 'request-123', status: 200 },
] as const

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

function renderHtml(resultSummary: string, summaries: ReturnType<typeof summarize>[]): string {
    const tables = benchmarkCases
        .map(benchmarkCase => {
            const rows = new Map(summaries.filter(row => row.scenario === benchmarkCase.name).map(row => [row.implementation, row]))
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

    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Benchmark results</title><style>body{font-family:system-ui,sans-serif;margin:2rem}table{border-collapse:collapse;margin-bottom:2rem}th,td{border:1px solid #ccc;padding:.5rem;text-align:right}th:first-child{text-align:left}.source-express-cargo{--source-color:#2563eb;--source-bg:#eff6ff}.source-zod{--source-color:#7c3aed;--source-bg:#f5f3ff}.source-class-validator{--source-color:#ea580c;--source-bg:#fff7ed}th.source,td.source{background:var(--source-bg)}th.source{color:var(--source-color)}td.source{border-left:3px solid var(--source-color)}.best{background:#d1fae5;color:#065f46;font-weight:700}</style></head><body><main><h1>Benchmark results</h1><p>${resultSummary}</p>${tables}</main></body></html>\n`
}

async function main(): Promise<void> {
    const arguments_ = process.argv.slice(2).filter(argument => argument !== '--')
    const checkOnly = arguments_.includes('--check')
    const positionalArguments = arguments_.filter(argument => argument !== '--check')
    const [callsArgument, maxConcurrencyArgument] = positionalArguments
    const calls = Number(callsArgument ?? 1000)
    const maxConcurrency = Number(maxConcurrencyArgument ?? 1000)
    if (!Number.isInteger(calls) || calls < 1) throw new Error(`Calls per API must be a positive integer: ${callsArgument}`)
    if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
        throw new Error(`Maximum concurrency must be a positive integer: ${maxConcurrencyArgument}`)
    }

    const connectionCount = Math.min(maxConcurrency, 100)
    // ponytail: stay below macOS's default TCP backlog; pipelining preserves the requested in-flight concurrency.
    const dispatcher = new Agent({ connections: connectionCount, pipelining: Math.ceil(maxConcurrency / connectionCount) })
    setGlobalDispatcher(dispatcher)
    const server = app.listen(0, '127.0.0.1')
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
            { ...benchmarkCases[0], response: expectedResponse },
            {
                ...benchmarkCases[1],
                response: invalidExpectation.response,
            },
            { ...benchmarkCases[2], response: nestedExpectedResponse },
            {
                name: 'missing query field',
                path: '/orders/42',
                body: validBody,
                requestId: 'request-123',
                ...invalidExpectation,
            },
            {
                name: 'repeated query field',
                path: '/orders/42?active=true&active=false',
                body: validBody,
                requestId: 'request-123',
                ...invalidExpectation,
            },
            {
                name: 'bracketed query field',
                path: '/orders/42?active[]=true',
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
                path: '/orders/Infinity?active=true',
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
            console.log(`Validated ${parityCases.length} shared request/response cases.`)
            return
        }

        const warmupCalls = Math.min(calls, Math.max(100, maxConcurrency))
        const combinations = benchmarkCases.flatMap(benchmarkCase => routes.map(route => ({ benchmarkCase, route })))
        const summaries = []
        for (const { benchmarkCase, route } of combinations) {
            const implementation = route.name
            await runConcurrent(warmupCalls, maxConcurrency, async () => {
                await post(baseUrl, `${route.prefix}${benchmarkCase.path}`, benchmarkCase.body, benchmarkCase.requestId)
            })

            const implementationLatencies: number[] = []
            const started = performance.now()
            await runConcurrent(calls, maxConcurrency, async () => {
                const implementationResponse = await post(
                    baseUrl,
                    `${route.prefix}${benchmarkCase.path}`,
                    benchmarkCase.body,
                    benchmarkCase.requestId,
                )
                strictEqual(implementationResponse.status, benchmarkCase.status)
                implementationLatencies.push(implementationResponse.latencyMilliseconds)
            })
            summaries.push(summarize(benchmarkCase.name, implementation, implementationLatencies, performance.now() - started, maxConcurrency))
        }

        const resultSummary = `Validated ${parityCases.length} shared request/response cases. Measured ${benchmarkCases.length} scenarios with ${calls} calls per API at maximum concurrency ${maxConcurrency} after ${warmupCalls} warm-up calls.`
        console.log(resultSummary)
        console.table(summaries)

        const resultFileName = `benchmark-results-${new Date().toISOString().replace(/[:.]/g, '-')}.html`
        writeFileSync(resultFileName, renderHtml(resultSummary, summaries))
        console.log(`Saved ${resultFileName}`)
    } finally {
        await dispatcher.close()
        server.closeAllConnections()
        await new Promise<void>((resolve, reject) => server.close(error => (error ? reject(error) : resolve())))
    }
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
