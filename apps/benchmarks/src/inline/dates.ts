import 'reflect-metadata'
import { writeFileSync } from 'node:fs'
import { RequestHandler } from 'express'
import * as cargo from 'express-cargo'
import { bindingCargo, Body, Each, List, MaxDate, MaxDuration, MinDate, MinDuration, TemporalDurationLike, Type } from 'express-cargo'
// The routes module registers the cargo error handler that answers validation failures.
import '../testcase/libraries/express-cargo/routes'
import { InlineRequest, inlineArguments, measureInline } from '../testcase/common/inline'
import { optionValue } from '../testcase/common/options'

// Measures binding date fields inline: Date fields on every runtime and ref, and the same shape with Temporal types
// where the runtime ships Temporal (Node.js 26+) and the express-cargo build supports it.
// `benchmark:version` runs it on both refs, so the Date rows compare the old and new Date handling.

type DateCase = { name: string; middleware: RequestHandler; request: InlineRequest; status: number }

const SLOT_COUNT = 10

function dateCases(): DateCase[] {
    class DateRequest {
        @Body()
        @MinDate(new Date('2020-01-01T00:00:00Z'))
        @MaxDate(() => new Date('2100-01-01T00:00:00Z'))
        createdAt!: Date

        @Body()
        @MinDate(new Date('2020-01-01T00:00:00Z'))
        dueDate!: Date

        @Body()
        @List('date')
        @Each(MinDate(new Date('2020-01-01T00:00:00Z')))
        slots!: Date[]
    }

    const middleware = bindingCargo(DateRequest)
    const slots = Array.from({ length: SLOT_COUNT }, (_, index) => `2026-03-${String(index + 1).padStart(2, '0')}`)
    return [
        {
            name: 'date valid',
            middleware,
            request: { body: { createdAt: '2026-01-01T09:00:00Z', dueDate: '2026-03-01', slots } },
            status: 200,
        },
        {
            name: 'date failure',
            middleware,
            request: { body: { createdAt: '2019-01-01T09:00:00Z', dueDate: 'not a date', slots: [...slots.slice(1), '2019-12-31'] } },
            status: 400,
        },
    ]
}

function temporalCases(): DateCase[] {
    // TypeScript 5.8 has no Temporal types, so the namespace is read untyped.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const T = (globalThis as any).Temporal
    const minDay = T.PlainDate.from('2020-01-01')

    class TemporalRequest {
        @Body()
        @Type(() => T.Instant)
        @MinDate(T.Instant.from('2020-01-01T00:00:00Z'))
        @MaxDate(() => T.Instant.from('2100-01-01T00:00:00Z'))
        createdAt!: unknown

        @Body()
        @Type(() => T.PlainDate)
        @MinDate(minDay)
        dueDate!: unknown

        @Body()
        @Type(() => T.ZonedDateTime)
        startsAt!: unknown

        @Body()
        @Type(() => T.Duration)
        @MinDuration('PT30M')
        @MaxDuration('PT4H')
        length!: TemporalDurationLike

        @Body()
        @List('plainDate')
        @Each(MinDate(minDay))
        slots!: unknown[]
    }

    const middleware = bindingCargo(TemporalRequest)
    const slots = Array.from({ length: SLOT_COUNT }, (_, index) => `2026-03-${String(index + 1).padStart(2, '0')}`)
    const valid = {
        createdAt: '2026-01-01T09:00:00Z',
        dueDate: '2026-03-01',
        startsAt: '2026-03-01T09:00+09:00[Asia/Seoul]',
        length: 'PT1H30M',
        slots,
    }
    return [
        { name: 'temporal valid', middleware, request: { body: valid }, status: 200 },
        {
            name: 'temporal object body',
            middleware,
            request: {
                body: {
                    ...valid,
                    dueDate: { year: 2026, month: 3, day: 1 },
                    startsAt: { year: 2026, month: 3, day: 1, hour: 9, timeZone: 'Asia/Seoul' },
                    length: { hours: 1, minutes: 30 },
                },
            },
            status: 200,
        },
        {
            name: 'temporal failure',
            middleware,
            request: {
                body: { ...valid, createdAt: 'not an instant', dueDate: '2019-12-31', length: 'PT10H', slots: [...slots.slice(1), '2019-12-31'] },
            },
            status: 400,
        },
    ]
}

/** True where the runtime ships Temporal and the express-cargo build binds it. */
function temporalAvailable(): boolean {
    return typeof (globalThis as { Temporal?: unknown }).Temporal === 'object' && 'MinDuration' in cargo
}

function main(): void {
    const arguments_ = process.argv.slice(2).filter(argument => argument !== '--')
    const jsonFileName = optionValue(arguments_, 'json')
    const { callsPerSample, samples } = inlineArguments(arguments_)

    const cases = [...dateCases(), ...(temporalAvailable() && Number(process.versions.node.split('.')[0]) >= 26 ? temporalCases() : [])]
    const results = cases.map(({ name, middleware, request, status }) => measureInline(name, middleware, request, status, callsPerSample, samples))

    console.log(`Measured date binding inline on Node.js ${process.versions.node}: ${samples} samples of ${callsPerSample} calls after a warm-up.`)
    if (cases.length === 2) console.log('Temporal cases skipped: this runtime or express-cargo build does not bind Temporal.')
    console.table(results)

    if (jsonFileName !== undefined) {
        writeFileSync(jsonFileName, `${JSON.stringify({ callsPerSample, samples, results }, null, 2)}\n`)
        console.log(`Saved ${jsonFileName}`)
    }
}

main()
