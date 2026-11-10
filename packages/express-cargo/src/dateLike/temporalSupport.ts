/** The first Node.js major version whose built-in Temporal express-cargo supports. */
export const TEMPORAL_MIN_NODE_MAJOR = 26

/** What {@link detectTemporal} looks at. Injected by tests to simulate other runtimes. */
export interface TemporalEnvironment {
    /** `process.versions.node`, such as `"26.1.0"`. */
    nodeVersion: string | undefined
    /** The global object the runtime exposes `Temporal` on. */
    globalObject: { Temporal?: unknown }
}

function currentEnvironment(): TemporalEnvironment {
    return {
        nodeVersion: typeof process === 'undefined' ? undefined : process.versions?.node,
        globalObject: globalThis as { Temporal?: unknown },
    }
}

/**
 * True when the runtime is Node.js 26 or later and ships `Temporal`.
 * Both are required: a polyfill on an older Node.js, or the `--harmony-temporal` flag on Node.js 24,
 * provides a `Temporal` global but is not a supported runtime.
 */
export function detectTemporal(env: TemporalEnvironment = currentEnvironment()): boolean {
    const major = Number(env.nodeVersion?.split('.')[0])
    return major >= TEMPORAL_MIN_NODE_MAJOR && typeof env.globalObject.Temporal === 'object' && env.globalObject.Temporal !== null
}

let supported: boolean | undefined

/** {@link detectTemporal} for the current runtime, decided once on first use. */
export function isTemporalSupported(): boolean {
    if (supported === undefined) supported = detectTemporal()
    return supported
}

/**
 * The Temporal type name of a constructor, such as `"PlainDate"`, or undefined when it is not a Temporal type.
 * It reads the prototype's `Symbol.toStringTag` instead of the `Temporal` global,
 * so it also recognizes Temporal types where express-cargo does not support them, such as a polyfill.
 */
export function temporalTypeName(type: unknown): string | undefined {
    if (typeof type !== 'function' || typeof type.prototype !== 'object' || type.prototype === null) return undefined
    const tag = Object.prototype.toString.call(type.prototype)
    return tag.startsWith('[object Temporal.') ? tag.slice('[object Temporal.'.length, -1) : undefined
}
