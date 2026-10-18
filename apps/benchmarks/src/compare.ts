import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, sep } from 'node:path'
import { Options, transformSync } from '@swc/core'
import { change, HttpRun, InProcessRun, median, range } from './results'
import { optionValue } from './scenarios'

// Benchmarks express-cargo at two git refs against the same benchmark app.
// Each run is a fresh Node process; the build that runs first alternates every round.

const EXPRESS_CARGO = 'packages/express-cargo'
const USAGE = 'Usage: compare.js <base ref> <target ref> [rounds=6] [calls=20000] [max concurrency=1000] [--inprocess-rounds=3]'

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
    const inProcessRounds = integerArgument(optionValue(arguments_, 'inprocess-rounds'), 3, 'In-process rounds')

    const repositoryRoot = git(process.cwd(), 'rev-parse', '--show-toplevel').trim()
    const sides = [
        { label: 'base', ref: baseRef, http: [] as HttpRun[], inProcess: [] as InProcessRun[] },
        { label: 'target', ref: targetRef, http: [] as HttpRun[], inProcess: [] as InProcessRun[] },
    ].map(side => ({ ...side, commit: git(repositoryRoot, 'rev-parse', '--short', `${side.ref}^{commit}`).trim() }))
    const outputDirectory = `benchmark-results-compare-${new Date().toISOString().replace(/[:.]/g, '-')}`
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
            runScript('benchmark.js', [String(calls), String(maxConcurrency), `--json=${file}`])
            side.http.push(JSON.parse(readFileSync(file, 'utf8')))
        })
        runRounds(inProcessRounds, 'inprocess', (side, file) => {
            runScript('inprocess.js', [`--json=${file}`])
            side.inProcess.push(JSON.parse(readFileSync(file, 'utf8')))
        })
    } finally {
        buildExpressCargo(repositoryRoot, undefined)
    }

    const [base, target] = sides
    const compareRows = (key: string, valuesOf: (side: (typeof sides)[number]) => number[]) => {
        const before = valuesOf(base)
        const after = valuesOf(target)
        return {
            [`base ${key}`]: Math.round(median(before)),
            [`target ${key}`]: Math.round(median(after)),
            change: change(median(before), median(after)),
            'base range': range(before),
            'target range': range(after),
        }
    }
    const httpRows = (base.http[0]?.summaries ?? []).map(({ scenario, implementation }) => ({
        scenario,
        implementation,
        ...compareRows('req/s', side =>
            side.http.map(run => run.summaries.find(row => row.scenario === scenario && row.implementation === implementation)!['requests/sec']),
        ),
    }))
    const inProcessRows = (base.inProcess[0]?.results ?? []).map(({ scenario }) => ({
        scenario,
        ...compareRows('ops/s', side => side.inProcess.map(run => run.results.find(row => row.scenario === scenario)!['ops/sec'])),
    }))

    console.log(
        `\nbase = ${base.ref} (${base.commit}), target = ${target.ref} (${target.commit}). Medians over ${rounds} HTTP and ${inProcessRounds} in-process rounds.`,
    )
    if (httpRows.length > 0) console.table(httpRows)
    if (inProcessRows.length > 0) console.table(inProcessRows)
    const summary = { base: { ref: base.ref, commit: base.commit }, target: { ref: target.ref, commit: target.commit }, httpRows, inProcessRows }
    writeFileSync(join(outputDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
    console.log(`Saved ${outputDirectory}`)
}

main()
