import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, sep } from 'node:path'
import { Options, transformSync } from '@swc/core'
import { change, HttpRun, InlineRun, median, range } from '../testcase/common/results'
import { optionValue } from '../testcase/common/options'

// Benchmarks express-cargo at two git refs against the same benchmark app.
// Each run is a fresh Node process; the build that runs first alternates every round.

const EXPRESS_CARGO = 'packages/express-cargo'
const USAGE = 'Usage: version/compare.js <base ref> <target ref> [rounds=6] [calls=20000] [max concurrency=1000] [--inline-rounds=3]'

function git(cwd: string, ...args: string[]): string {
    return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

/**
 * Compiles packages/express-cargo/src at `ref` (the working tree when undefined) into dist/cjs,
 * which the benchmark app loads through the workspace link.
 */
function buildExpressCargo(repositoryRoot: string, ref: string | undefined): void {
    const swcOptions: Options = JSON.parse(readFileSync(join(repositoryRoot, EXPRESS_CARGO, '.swcrc.cjs.json'), 'utf8'))
    const sourceRoot = `${EXPRESS_CARGO}/src`
    const files =
        ref === undefined
            ? readdirSync(join(repositoryRoot, sourceRoot), { recursive: true, encoding: 'utf8' }).map(
                  file => `${sourceRoot}/${file.split(sep).join('/')}`,
              )
            : git(repositoryRoot, 'ls-tree', '-r', '--name-only', ref, '--', sourceRoot).split('\n')
    const outputRoot = join(repositoryRoot, EXPRESS_CARGO, 'dist', 'cjs')
    rmSync(outputRoot, { recursive: true, force: true })
    for (const file of files.filter(file => file.endsWith('.ts'))) {
        const source = ref === undefined ? readFileSync(join(repositoryRoot, file), 'utf8') : git(repositoryRoot, 'show', `${ref}:${file}`)
        const { code } = transformSync(source, { ...swcOptions, filename: file, swcrc: false, configFile: false })
        const outputFile = join(outputRoot, posix.relative(sourceRoot, file).replace(/\.ts$/, '.js'))
        mkdirSync(dirname(outputFile), { recursive: true })
        writeFileSync(outputFile, code)
    }
}

function runScript(script: string, args: string[]): void {
    execFileSync(process.execPath, [join(__dirname, script), ...args], { stdio: 'inherit' })
}

function integerArgument(value: string | undefined, fallback: number, name: string): number {
    const parsed = Number(value ?? fallback)
    if (!Number.isInteger(parsed) || parsed < 0) throw new Error(`${name} must be a non-negative integer: ${value}`)
    return parsed
}

function main(): void {
    const arguments_ = process.argv.slice(2).filter(argument => argument !== '--')
    const [baseRef, targetRef, roundsArgument, callsArgument, maxConcurrencyArgument] = arguments_.filter(argument => !argument.startsWith('--'))
    if (baseRef === undefined || targetRef === undefined) throw new Error(USAGE)
    const rounds = integerArgument(roundsArgument, 6, 'Rounds')
    const calls = integerArgument(callsArgument, 20000, 'Calls')
    const maxConcurrency = integerArgument(maxConcurrencyArgument, 1000, 'Maximum concurrency')
    const inlineRounds = integerArgument(optionValue(arguments_, 'inline-rounds'), 3, 'Inline rounds')

    const repositoryRoot = git(process.cwd(), 'rev-parse', '--show-toplevel').trim()
    const sides = [
        { label: 'base', ref: baseRef, http: [] as HttpRun[], inline: [] as InlineRun[], dates: [] as InlineRun[] },
        { label: 'target', ref: targetRef, http: [] as HttpRun[], inline: [] as InlineRun[], dates: [] as InlineRun[] },
    ].map(side => ({ ...side, commit: git(repositoryRoot, 'rev-parse', '--short', `${side.ref}^{commit}`).trim() }))
    const outputDirectory = `benchmark-results-version-${new Date().toISOString().replace(/[:.]/g, '-')}`
    mkdirSync(outputDirectory)

    const runRounds = (count: number, kind: string, run: (side: (typeof sides)[number], file: string) => void) => {
        for (let round = 1; round <= count; round++) {
            for (const side of round % 2 === 1 ? sides : [...sides].reverse()) {
                console.log(`\n[${kind} ${round}/${count}] ${side.label} ${side.ref} (${side.commit})`)
                buildExpressCargo(repositoryRoot, side.ref)
                run(side, join(outputDirectory, `${kind}-${side.label}-${side.commit}-r${round}.json`))
            }
        }
    }

    try {
        runRounds(rounds, 'http', (side, file) => {
            runScript('../http/benchmark.js', [String(calls), String(maxConcurrency), '1', `--json=${file}`])
            side.http.push(JSON.parse(readFileSync(file, 'utf8')))
        })
        runRounds(inlineRounds, 'inline', (side, file) => {
            runScript('../inline/benchmark.js', ['--only=express-cargo', `--json=${file}`])
            side.inline.push(JSON.parse(readFileSync(file, 'utf8')))
        })
        runRounds(inlineRounds, 'dates', (side, file) => {
            runScript('../inline/dates.js', [`--json=${file}`])
            side.dates.push(JSON.parse(readFileSync(file, 'utf8')))
        })
    } finally {
        buildExpressCargo(repositoryRoot, undefined)
    }

    const [base, target] = sides
    // A scenario only one ref runs, such as a Temporal case the base cannot bind, shows '-' on the other side.
    const compareRows = (key: string, valuesOf: (side: (typeof sides)[number]) => number[]) => {
        const before = valuesOf(base)
        const after = valuesOf(target)
        const both = before.length > 0 && after.length > 0
        return {
            [`base ${key}`]: before.length > 0 ? Math.round(median(before)) : '-',
            [`target ${key}`]: after.length > 0 ? Math.round(median(after)) : '-',
            change: both ? change(median(before), median(after)) : '-',
            'base range': before.length > 0 ? range(before) : '-',
            'target range': after.length > 0 ? range(after) : '-',
        }
    }
    const inlineRowsOf = (runsOf: (side: (typeof sides)[number]) => InlineRun[]) => {
        const scenarios = [...new Set(sides.flatMap(side => (runsOf(side)[0]?.results ?? []).map(row => row.scenario)))]
        return scenarios.map(scenario => ({
            scenario,
            ...compareRows('ops/s', side =>
                runsOf(side).flatMap(run => run.results.filter(row => row.scenario === scenario).map(row => row['ops/sec'])),
            ),
        }))
    }
    const httpRows = (base.http[0]?.summaries ?? []).map(({ scenario, implementation }) => ({
        scenario,
        implementation,
        ...compareRows('req/s', side =>
            side.http.map(run => run.summaries.find(row => row.scenario === scenario && row.implementation === implementation)!['requests/sec']),
        ),
    }))
    const inlineRows = inlineRowsOf(side => side.inline)
    const dateRows = inlineRowsOf(side => side.dates)

    console.log(
        `\nbase = ${base.ref} (${base.commit}), target = ${target.ref} (${target.commit}). Medians over ${rounds} HTTP and ${inlineRounds} inline and date rounds.`,
    )
    if (httpRows.length > 0) console.table(httpRows)
    if (inlineRows.length > 0) console.table(inlineRows)
    if (dateRows.length > 0) console.table(dateRows)
    const summary = {
        base: { ref: base.ref, commit: base.commit },
        target: { ref: target.ref, commit: target.commit },
        httpRows,
        inlineRows,
        dateRows,
    }
    writeFileSync(join(outputDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
    console.log(`Saved ${outputDirectory}`)
}

main()
