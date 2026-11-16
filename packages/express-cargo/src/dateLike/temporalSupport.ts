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

/** True on Node.js 26 or later with `Temporal`; a polyfill or Node.js 24's `--harmony-temporal` does not count. */
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

/** The Temporal type name of a value, such as `"PlainDate"`, or undefined when it is not a Temporal instance. */
export function temporalValueName(value: unknown): string | undefined {
    return typeof value === 'object' && value !== null ? temporalTypeName(value.constructor) : undefined
}

const TEMPORAL_TYPE_NAME_CACHE = new WeakMap<object, string | null>()

/**
 * The Temporal type name of a constructor, such as `"PlainDate"`. Read from `Symbol.toStringTag`, so it also
 * recognizes unsupported Temporal types such as a polyfill.
 */
export function temporalTypeName(type: unknown): string | undefined {
    if (typeof type !== 'function') return undefined

    // Cached because deep equality and Temporal casts ask this for every value they see.
    let name = TEMPORAL_TYPE_NAME_CACHE.get(type)
    if (name === undefined) {
        name = readTemporalTypeName(type) ?? null
        TEMPORAL_TYPE_NAME_CACHE.set(type, name)
    }
    return name ?? undefined
}

function readTemporalTypeName(type: { prototype?: unknown }): string | undefined {
    if (typeof type.prototype !== 'object' || type.prototype === null) return undefined
    const tag = Object.prototype.toString.call(type.prototype)
    return tag.startsWith('[object Temporal.') ? tag.slice('[object Temporal.'.length, -1) : undefined
}
