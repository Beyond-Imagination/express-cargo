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
    implementation?: string
    'ops/sec': number
    'µs/op': number
    'minimum ops/sec': number
    'maximum ops/sec': number
}

/** A warmed-up middleware call; each `sample()` times `callsPerSample` calls and returns ops/sec. */
export type InlineSampler = { sample(): number }

/**
 * Warms up a middleware with `callsPerSample` direct calls, without HTTP, and checks the status it answers with.
 * Validation failures are expected to be answered with res.status(400).json(...); parsers may keep their result in res.locals.
 */
export function prepareInline(
    scenario: string,
    middleware: RequestHandler,
    fields: InlineRequest,
    expectedStatus: number,
    callsPerSample: number,
): InlineSampler {
    let status = 200
    let nextError: unknown
    const response = {
        locals: {},
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

    return {
        sample() {
            const started = process.hrtime.bigint()
            run(callsPerSample)
            return callsPerSample / (Number(process.hrtime.bigint() - started) / 1e9)
        },
    }
}

/** The median of the samples, with the slowest and fastest sample. */
export function summarizeInline(opsPerSecond: readonly number[]): Omit<InlineResult, 'scenario' | 'implementation'> {
    const medianOps = median(opsPerSecond)
    return {
        'ops/sec': Math.round(medianOps),
        'µs/op': Number((1e6 / medianOps).toFixed(3)),
        'minimum ops/sec': Math.round(Math.min(...opsPerSecond)),
        'maximum ops/sec': Math.round(Math.max(...opsPerSecond)),
    }
}

/** Warms up a middleware, then takes `samples` timed samples of `callsPerSample` calls in a row. */
export function measureInline(
    scenario: string,
    middleware: RequestHandler,
    fields: InlineRequest,
    expectedStatus: number,
    callsPerSample: number,
    samples: number,
): InlineResult {
    const sampler = prepareInline(scenario, middleware, fields, expectedStatus, callsPerSample)
    return { scenario, ...summarizeInline(Array.from({ length: samples }, () => sampler.sample())) }
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
