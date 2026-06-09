import 'reflect-metadata'
import { CargoClassMetadata } from '../../src/metadata'
import { Body } from '../../src'
import { analyzeCargoSchema } from '../../src/analysis'

describe('CargoClassMetadata.resolve caching', () => {
    it('caches field lists so post-resolve mutations are not reflected', () => {
        class Sample {
            @Body()
            a!: string
        }

        const meta = new CargoClassMetadata(Sample.prototype).resolve()
        const before = meta.getFieldList()
        expect(before).toEqual(['a'])

        // Add a field directly to the prototype metadata *after* resolve().
        meta.setFieldList('b')

        // Cached: the resolved snapshot still wins, so 'b' is not visible.
        expect(meta.getFieldList()).toEqual(['a'])
    })

    it('walks the prototype chain when not resolved', () => {
        class Sample {
            @Body()
            a!: string
        }

        const meta = new CargoClassMetadata(Sample.prototype)
        expect(meta.getFieldList()).toEqual(['a'])

        meta.setFieldList('b')

        // Not cached: a fresh walk reflects the newly added field.
        expect(meta.getFieldList()).toEqual(expect.arrayContaining(['a', 'b']))
    })

    it('returns the same array reference across reads after resolve (no recomputation)', () => {
        class Sample {
            @Body()
            a!: string

            @Body()
            b!: string
        }

        const meta = new CargoClassMetadata(Sample.prototype).resolve()

        // A walk would build a new array each call; the cache returns the stored reference.
        expect(meta.getFieldList()).toBe(meta.getFieldList())
        expect(meta.getRequestFieldList()).toBe(meta.getRequestFieldList())
        expect(meta.getVirtualFieldList()).toBe(meta.getVirtualFieldList())
        expect(meta.getAllFieldsList()).toBe(meta.getAllFieldsList())
    })

    it('resolves every list kind, not just allFields', () => {
        class Sample {
            @Body()
            a!: string
        }

        const meta = new CargoClassMetadata(Sample.prototype).resolve()

        // Mutate each underlying list after resolve; none should leak through the cache.
        meta.setFieldList('x')
        meta.setRequestFieldList('y')
        meta.setVirtualFieldList('z')

        expect(meta.getFieldList()).not.toContain('x')
        expect(meta.getRequestFieldList()).not.toContain('y')
        expect(meta.getVirtualFieldList()).not.toContain('z')
    })

    it('analyzeCargoSchema produces resolved (cached) metadata', () => {
        class Nested {
            @Body()
            n!: string
        }

        class Root {
            @Body()
            r!: string
        }

        const result = analyzeCargoSchema(Root)
        const rootMeta = result.rootMeta

        const snapshot = rootMeta.getFieldList()
        rootMeta.setFieldList('late')

        // Metadata coming out of analysis must already be resolved/cached.
        expect(rootMeta.getFieldList()).toEqual(snapshot)
        expect(rootMeta.getFieldList()).toBe(rootMeta.getFieldList())
    })
})
