import { writeFileSync } from 'node:fs'
import { RequestHandler } from 'express'
// Each routes module exports its parser; the express-cargo one also registers the cargo error handler.
import { parseRequest as parseExpressCargo } from '../testcase/libraries/express-cargo/routes'
import { parseRequest as parseZod } from '../testcase/libraries/zod/routes'
import { parseRequest as parseClassValidator } from '../testcase/libraries/class-validator/routes'
import { inlineArguments, prepareInline, summarizeInline } from '../testcase/common/inline'
import { BenchmarkRoute, optionValue, selectRoutes } from '../testcase/common/options'
import { benchmarkCases } from '../testcase/scenarios'

// Calls each library's parsing middleware directly, without HTTP, to measure parsing and validation alone.
// Every case is warmed up first; samples are then taken in turn across all cases, starting one case later each pass,
// so no library always runs first or right after another. The reported value is the median sample.

const PARSERS: Record<BenchmarkRoute['sourceClass'], RequestHandler> = {
    'express-cargo': parseExpressCargo,
    zod: parseZod,
    'class-validator': parseClassValidator,
}

function toRequestFields(benchmarkCase: (typeof benchmarkCases)[number]) {
    const url = new URL(benchmarkCase.path, 'http://localhost')
    return {
        body: benchmarkCase.body,
        params: { id: url.pathname.slice(url.pathname.lastIndexOf('/') + 1) },
        query: Object.fromEntries(url.searchParams),
        headers: { 'request-id': benchmarkCase.requestId },
    }
}

function main(): void {
    const arguments_ = process.argv.slice(2).filter(argument => argument !== '--')
    const jsonFileName = optionValue(arguments_, 'json')
    // --only=<sourceClass,...> limits the libraries, e.g. `benchmark:version` measures express-cargo alone.
    const measuredRoutes = selectRoutes(optionValue(arguments_, 'only'))
    const { callsPerSample, samples } = inlineArguments(arguments_)

    const cases = benchmarkCases.flatMap(benchmarkCase =>
        measuredRoutes.map(route => ({
            scenario: benchmarkCase.name,
            implementation: route.name,
            sampler: prepareInline(
                `${benchmarkCase.name} / ${route.name}`,
                PARSERS[route.sourceClass],
                toRequestFields(benchmarkCase),
                benchmarkCase.status,
                callsPerSample,
            ),
            opsPerSecond: [] as number[],
        })),
    )

    for (let pass = 0; pass < samples; pass++) {
        for (let index = 0; index < cases.length; index++) {
            const measured = cases[(pass + index) % cases.length]
            measured.opsPerSecond.push(measured.sampler.sample())
        }
    }

    const results = cases.map(({ scenario, implementation, opsPerSecond }) => ({
        scenario,
        implementation,
        ...summarizeInline(opsPerSecond),
    }))

    console.log(
        `Measured parsing inline: ${samples} samples of ${callsPerSample} calls per library and scenario, after ${callsPerSample} warm-up calls.`,
    )
    console.table(results)

    if (jsonFileName !== undefined) {
        writeFileSync(jsonFileName, `${JSON.stringify({ callsPerSample, samples, results }, null, 2)}\n`)
        console.log(`Saved ${jsonFileName}`)
    }
}

main()
