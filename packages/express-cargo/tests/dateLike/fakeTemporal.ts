/**
 * A constructor tagged like a Temporal type, standing in for a polyfill.
 * It lets tests exercise Temporal handling on runtimes without Temporal.
 */
export function fakeTemporalType(name: string): new () => object {
    const FakeTemporalType = class {}
    Object.defineProperty(FakeTemporalType, 'name', { value: name })
    Object.defineProperty(FakeTemporalType.prototype, Symbol.toStringTag, { value: `Temporal.${name}` })
    return FakeTemporalType
}
