import 'reflect-metadata'
import { CargoClassMetadata } from '../../src/metadata'
import { bindingCargo, Body, getCargo, List, Request, Virtual } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from '../binding/testUtils'
import { analyzeCargoSchema } from '../../src/analysis'

describe('CargoClassMetadata.resolve caching', () => {
    it('binds resolved fields without per-field metadata lookups', () => {
        const symbolField = Symbol('symbolField')
        class Parent {
            @Body('user_name')
            name!: string
        }
        class Item {
            @Body('quantity')
            count!: number
        }
        class Sample extends Parent {
            @Body('input')
            [symbolField]!: string

            @Request(req => req.headers['request-id'] as string)
            requestId!: string

            @Body()
            @List(Item)
            items!: Item[]

            @Virtual((obj: Sample) => `${obj.requestId}:${obj.name}:${obj[symbolField]}:${obj.items[0].count}`)
            summary!: string
        }

        const middleware = bindingCargo(Sample)
        const analysis = analyzeCargoSchema(Sample)
        const lookups = [...analysis.metadataMap.values()].map(meta => jest.spyOn(meta, 'getFieldMetadata'))
        try {
            const req = makeMockReq({
                body: { user_name: 'Alice', input: 'value', items: [{ quantity: '2' }] },
                headers: { 'request-id': 'request-123' },
            })
            const next = makeNext()
            middleware(req, makeMockRes(), next)

            expect(next).toHaveBeenCalledWith()
            const cargo = getCargo<Sample>(req)
            expect(cargo.name).toBe('Alice')
            expect(cargo[symbolField]).toBe('value')
            expect(cargo.items[0]).toBeInstanceOf(Item)
            expect(cargo.summary).toBe('request-123:Alice:value:2')
            for (const lookup of lookups) expect(lookup).not.toHaveBeenCalled()
        } finally {
            for (const lookup of lookups) lookup.mockRestore()
        }
    })

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

    it('caches field metadata during resolve', () => {
        class Sample {
            @Body('input')
            value!: string
        }

        const meta = new CargoClassMetadata(Sample.prototype).resolve()
        Reflect.deleteMetadata(meta.getMetadataKey('value'), Sample.prototype)

        expect(meta.getFieldMetadata('value').getKey()).toBe('input')
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
