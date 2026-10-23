/** The `--json` output of benchmark.js (HTTP). */
export type HttpRun = {
    routeOrder: string[]
    summaries: { scenario: string; implementation: string; 'requests/sec': number }[]
}

/** The `--json` output of inprocess.js. */
export type InProcessRun = {
    results: { scenario: string; 'ops/sec': number }[]
}

export function median(values: readonly number[]): number {
    const sorted = [...values].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export function range(values: readonly number[]): string {
    return `${Math.round(Math.min(...values))}–${Math.round(Math.max(...values))}`
}

export function change(before: number, after: number): string {
    const percent = (after / before - 1) * 100
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`
}
