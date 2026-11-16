import { detectTemporal, temporalTypeName } from '../../src/dateLike'
import { isUserDefinedClass } from '../../src/utils'
import { fakeTemporalType } from './fakeTemporal'

describe('detectTemporal', () => {
    const withTemporal = { Temporal: {} }

    it.each([
        ['Node.js 26 with built-in Temporal', true, '26.0.0', withTemporal],
        ['a later Node.js with built-in Temporal', true, '27.3.1', withTemporal],
        ['Node.js 26 built without Temporal', false, '26.0.0', {}],
        ['Node.js 24 with --harmony-temporal', false, '24.22.1', withTemporal],
        ['Node.js 22 with a polyfill', false, '22.11.0', withTemporal],
        ['Node.js 20 with a polyfill', false, '20.18.0', withTemporal],
        ['Node.js 20', false, '20.18.0', {}],
        ['a runtime without a Node.js version', false, undefined, withTemporal],
    ])('%s → %s', (_name, expected, nodeVersion, globalObject) => {
        expect(detectTemporal({ nodeVersion, globalObject })).toBe(expected)
    })

    it('does not treat a non-object Temporal global as built-in Temporal', () => {
        expect(detectTemporal({ nodeVersion: '26.0.0', globalObject: { Temporal: null } })).toBe(false)
        expect(detectTemporal({ nodeVersion: '26.0.0', globalObject: { Temporal: 'Temporal' } })).toBe(false)
    })
})

describe('temporalTypeName', () => {
    it('reads the Temporal type name from the prototype tag', () => {
        expect(temporalTypeName(fakeTemporalType('PlainDate'))).toBe('PlainDate')
        expect(temporalTypeName(fakeTemporalType('ZonedDateTime'))).toBe('ZonedDateTime')
    })

    it('ignores other constructors and values', () => {
        expect(temporalTypeName(Date)).toBeUndefined()
        expect(temporalTypeName(class Dto {})).toBeUndefined()
        expect(temporalTypeName(() => 'PlainDate')).toBeUndefined()
        expect(temporalTypeName('Temporal.PlainDate')).toBeUndefined()
        expect(temporalTypeName(undefined)).toBeUndefined()
    })

    const realTemporal = (globalThis as { Temporal?: Record<string, unknown> }).Temporal
    ;(realTemporal ? it : it.skip)('recognizes the Temporal types of this runtime', () => {
        expect(temporalTypeName(realTemporal!.PlainDate)).toBe('PlainDate')
        expect(temporalTypeName(realTemporal!.Instant)).toBe('Instant')
        expect(temporalTypeName(realTemporal!.Duration)).toBe('Duration')
    })

    it('keeps Temporal types out of nested DTO binding', () => {
        expect(isUserDefinedClass(fakeTemporalType('PlainDate'))).toBe(false)
    })
})
