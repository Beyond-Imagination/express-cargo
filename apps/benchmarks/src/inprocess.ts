import { strictEqual } from 'node:assert'
import { writeFileSync } from 'node:fs'
import { Request, Response } from 'express'
import { bindingCargo } from 'express-cargo'
import { CargoRequest } from './app'
import { median } from './results'
import { benchmarkCases, optionValue } from './scenarios'

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
    const [callsArgument, samplesArgument] = arguments_.filter(argument => !argument.startsWith('--'))
    const callsPerSample = Number(callsArgument ?? 20000)
    const samples = Number(samplesArgument ?? 7)
    if (!Number.isInteger(callsPerSample) || callsPerSample < 1) throw new Error(`Calls per sample must be a positive integer: ${callsArgument}`)
    if (!Number.isInteger(samples) || samples < 1) throw new Error(`Samples must be a positive integer: ${samplesArgument}`)

    const middleware = bindingCargo(CargoRequest)
    let status = 200
    let nextError: unknown
    // The app's cargo error handler answers validation failures with res.status(400).json(...).
    const response = {
        status(code: number) {
            status = code
            return this
        },
        json() {
            return this
        },
    } as unknown as Response

    const results = benchmarkCases.map(benchmarkCase => {
        const fields = toRequestFields(benchmarkCase)
        const run = (calls: number) => {
            for (let index = 0; index < calls; index++) {
                status = 200
                nextError = undefined
                middleware({ ...fields } as unknown as Request, response, (error?: unknown) => {
                    nextError = error
                })
            }
        }

        run(callsPerSample)
        strictEqual(nextError, undefined, `${benchmarkCase.name}: unexpected error`)
        strictEqual(status, benchmarkCase.status, `${benchmarkCase.name}: unexpected status`)

        const opsPerSecond = Array.from({ length: samples }, () => {
            const started = process.hrtime.bigint()
            run(callsPerSample)
            return callsPerSample / (Number(process.hrtime.bigint() - started) / 1e9)
        })
        const medianOps = median(opsPerSecond)
        return {
            scenario: benchmarkCase.name,
            'ops/sec': Math.round(medianOps),
            'µs/op': Number((1e6 / medianOps).toFixed(3)),
            'minimum ops/sec': Math.round(Math.min(...opsPerSecond)),
            'maximum ops/sec': Math.round(Math.max(...opsPerSecond)),
        }
    })

    console.log(`Measured express-cargo binding in-process: ${samples} samples of ${callsPerSample} calls after ${callsPerSample} warm-up calls.`)
    console.table(results)

    if (jsonFileName !== undefined) {
        writeFileSync(jsonFileName, `${JSON.stringify({ callsPerSample, samples, results }, null, 2)}\n`)
        console.log(`Saved ${jsonFileName}`)
    }
}

main()
