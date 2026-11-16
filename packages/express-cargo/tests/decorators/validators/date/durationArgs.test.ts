import { MaxDuration, MinDuration } from '../../../../src'

describe('MinDuration and MaxDuration arguments', () => {
    it('reject an options object in place of the message when the decorator is created', () => {
        expect(() => MinDuration('PT1H', { relativeTo: '2026-01-01' } as any)).toThrow(
            '@MinDuration takes (bound, message?); message must be a string or a function',
        )
        expect(() => (MaxDuration as any)('PT1H', { relativeTo: '2026-01-01' }, 'too long')).toThrow('@MaxDuration takes (bound, message?)')
    })

    it('accept a string or function message', () => {
        expect(() => MinDuration('PT1H', 'too short')).not.toThrow()
        expect(() => MaxDuration('PT1H', () => 'too long')).not.toThrow()
        expect(() => MaxDuration('PT1H', null as any)).not.toThrow()
    })
})
