import { writeFileSync } from 'node:fs'
import { bindingCargo } from 'express-cargo'
// The routes module registers the cargo error handler that answers validation failures.
import '../testcase/libraries/express-cargo/routes'
import { CargoRequest } from '../testcase/libraries/express-cargo/types'
import { inlineArguments, measureInline } from '../testcase/common/inline'
import { optionValue } from '../testcase/common/options'
import { benchmarkCases } from '../testcase/scenarios'

// Calls the express-cargo middleware directly, without HTTP, to measure binding alone.
// Each sample is `callsPerSample` calls after a warm-up of the same size; the reported value is the median sample.

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
    const { callsPerSample, samples } = inlineArguments(arguments_)

    const middleware = bindingCargo(CargoRequest)
    const results = benchmarkCases.map(benchmarkCase =>
        measureInline(benchmarkCase.name, middleware, toRequestFields(benchmarkCase), benchmarkCase.status, callsPerSample, samples),
    )

    console.log(`Measured express-cargo binding inline: ${samples} samples of ${callsPerSample} calls after ${callsPerSample} warm-up calls.`)
    console.table(results)

    if (jsonFileName !== undefined) {
        writeFileSync(jsonFileName, `${JSON.stringify({ callsPerSample, samples, results }, null, 2)}\n`)
        console.log(`Saved ${jsonFileName}`)
    }
}

main()
