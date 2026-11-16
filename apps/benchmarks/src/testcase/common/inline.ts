import { strictEqual } from 'node:assert'
import { Request, RequestHandler, Response } from 'express'
import { median } from './results'

/** The request fields an express-cargo middleware reads. */
export type InlineRequest = {
    body?: unknown
    params?: Record<string, string>
    query?: Record<string, string>
    headers?: Record<string, string>
}

export type InlineResult = {
    scenario: string
    'ops/sec': number
    'µs/op': number
    'minimum ops/sec': number
    'maximum ops/sec': number
}

/**
 * Calls a middleware directly, without HTTP: a warm-up of `callsPerSample` calls, then `samples` timed samples.
 * The cargo error handler is expected to answer validation failures with res.status(400).json(...).
 */
export function measureInline(
    scenario: string,
    middleware: RequestHandler,
    fields: InlineRequest,
    expectedStatus: number,
    callsPerSample: number,
    samples: number,
): InlineResult {
    let status = 200
    let nextError: unknown
    const response = {
        status(code: number) {
            status = code
            return this
        },
        json() {
            return this
        },
    } as unknown as Response

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
    strictEqual(nextError, undefined, `${scenario}: unexpected error`)
    strictEqual(status, expectedStatus, `${scenario}: unexpected status`)

    const opsPerSecond = Array.from({ length: samples }, () => {
        const started = process.hrtime.bigint()
        run(callsPerSample)
        return callsPerSample / (Number(process.hrtime.bigint() - started) / 1e9)
    })
    const medianOps = median(opsPerSecond)
    return {
        scenario,
        'ops/sec': Math.round(medianOps),
        'µs/op': Number((1e6 / medianOps).toFixed(3)),
        'minimum ops/sec': Math.round(Math.min(...opsPerSecond)),
        'maximum ops/sec': Math.round(Math.max(...opsPerSecond)),
    }
}

/** Reads `[calls] [samples]` from the arguments, as the inline benchmarks take them. */
export function inlineArguments(argumentsList: readonly string[]): { callsPerSample: number; samples: number } {
    const [callsArgument, samplesArgument] = argumentsList.filter(argument => !argument.startsWith('--'))
    const callsPerSample = Number(callsArgument ?? 20000)
    const samples = Number(samplesArgument ?? 7)
    if (!Number.isInteger(callsPerSample) || callsPerSample < 1) throw new Error(`Calls per sample must be a positive integer: ${callsArgument}`)
    if (!Number.isInteger(samples) || samples < 1) throw new Error(`Samples must be a positive integer: ${samplesArgument}`)
    return { callsPerSample, samples }
}
