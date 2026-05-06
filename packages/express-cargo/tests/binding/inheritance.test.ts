import { bindingCargo, Body, CargoValidationError, getCargo, Min, Optional, Query } from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'

describe('binding with class inheritance', () => {
    it('should bind both parent and child fields when child class is used', () => {
        class Parent {
            @Body('parentField') parentField!: string
        }
        class Child extends Parent {
            @Body('childField') childField!: string
        }

        const middleware = bindingCargo(Child)
        const req = makeMockReq({
            body: { parentField: 'p', childField: 'c' },
        })
        const next = makeNext()
        middleware(req, makeMockRes(), next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<Child>(req)!
        expect(dto.parentField).toBe('p')
        expect(dto.childField).toBe('c')
    })

    it('should not leak parent prototype cache to child binding', () => {
        // Reflect.getMetadata follows the prototype chain. If the cache is
        // looked up with getMetadata, a child class with no own cache may
        // inadvertently read the parent's cache, causing child fields to
        // be missing from the result.
        class Parent {
            @Body('parentField') parentField!: string
        }
        class Child extends Parent {
            @Body('childField') childField!: string
        }

        const parentMiddleware = bindingCargo(Parent)
        const parentReq = makeMockReq({
            body: { parentField: 'parent-value' },
        })
        parentMiddleware(parentReq, makeMockRes(), makeNext())

        const childMiddleware = bindingCargo(Child)
        const childReq = makeMockReq({
            body: { parentField: 'p', childField: 'c' },
        })
        const childNext = makeNext()
        childMiddleware(childReq, makeMockRes(), childNext)

        expect(childNext).toHaveBeenCalledWith()
        const dto = getCargo<Child>(childReq)!
        expect(dto.parentField).toBe('p')
        expect(dto.childField).toBe('c')
    })

    it('should isolate caches between sibling classes sharing a parent', () => {
        class Parent {
            @Body('parentField') parentField!: string
        }
        class ChildA extends Parent {
            @Body('fieldA') fieldA!: string
        }
        class ChildB extends Parent {
            @Body('fieldB') fieldB!: string
        }

        const middlewareA = bindingCargo(ChildA)
        const reqA = makeMockReq({
            body: { parentField: 'p', fieldA: 'a' },
        })
        const nextA = makeNext()
        middlewareA(reqA, makeMockRes(), nextA)

        expect(nextA).toHaveBeenCalledWith()
        expect(getCargo<ChildA>(reqA)!.fieldA).toBe('a')

        const middlewareB = bindingCargo(ChildB)
        const reqB = makeMockReq({
            body: { parentField: 'p', fieldB: 'b' },
        })
        const nextB = makeNext()
        middlewareB(reqB, makeMockRes(), nextB)

        expect(nextB).toHaveBeenCalledWith()
        const dto = getCargo<ChildB>(reqB)!
        expect(dto.fieldB).toBe('b')
        expect(dto.parentField).toBe('p')
    })

    it('should not affect parent binding after child has been processed', () => {
        class Parent {
            @Body('parentField') parentField!: string
        }
        class Child extends Parent {
            @Body('childField') childField!: string
        }

        const childMiddleware = bindingCargo(Child)
        const childReq = makeMockReq({
            body: { parentField: 'p', childField: 'c' },
        })
        childMiddleware(childReq, makeMockRes(), makeNext())

        const parentMiddleware = bindingCargo(Parent)
        const parentReq = makeMockReq({
            body: { parentField: 'parent-only' },
        })
        const parentNext = makeNext()
        parentMiddleware(parentReq, makeMockRes(), parentNext)

        expect(parentNext).toHaveBeenCalledWith()
        const dto = getCargo<Parent>(parentReq)!
        expect(dto.parentField).toBe('parent-only')
    })

    it('should apply parent validators when binding through child', () => {
        // Validation rules defined on parent fields must still apply when
        // the child class is used as cargo.
        class Parent {
            @Body() @Min(10) score!: number
        }
        class Child extends Parent {
            @Body() name!: string
        }

        const middleware = bindingCargo(Child)
        const req = makeMockReq({
            body: { score: 5, name: 'Alice' }, // score < 10 should fail
        })
        const next = makeNext()
        middleware(req, makeMockRes(), next)

        const err = next.mock.calls[0][0]
        expect(err).toBeInstanceOf(CargoValidationError)
        expect(err.errors.some((e: CargoValidationError['errors'][number]) => e.message.includes('score'))).toBe(true)
    })

    it('should respect parent field source when binding through child', () => {
        // Parent fields declared with @Query should still read from query,
        // not body, when accessed through the child.
        class Parent {
            @Query('q') keyword!: string
        }
        class Child extends Parent {
            @Body('content') content!: string
        }

        const middleware = bindingCargo(Child)
        const req = makeMockReq({
            body: { content: 'hello' },
            query: { q: 'search-term' },
        })
        const next = makeNext()
        middleware(req, makeMockRes(), next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<Child>(req)!
        expect(dto.keyword).toBe('search-term')
        expect(dto.content).toBe('hello')
    })

    it('should respect parent field key alias when binding through child', () => {
        // Custom key alias like @Body('user_name') on parent must still be
        // honored when reading from the request body via child class.
        class Parent {
            @Body('user_name') name!: string
        }
        class Child extends Parent {
            @Body() age!: number
        }

        const middleware = bindingCargo(Child)
        const req = makeMockReq({
            body: { user_name: 'Alice', age: 30 },
        })
        const next = makeNext()
        middleware(req, makeMockRes(), next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<Child>(req)!
        expect(dto.name).toBe('Alice')
        expect(dto.age).toBe(30)
    })

    it('should treat parent Optional fields as optional when binding through child', () => {
        // Optional decorator on parent fields must still allow the field
        // to be missing in the request body.
        class Parent {
            @Body() @Optional() nickname?: string
        }
        class Child extends Parent {
            @Body() name!: string
        }

        const middleware = bindingCargo(Child)
        const req = makeMockReq({
            body: { name: 'Alice' }, // nickname omitted
        })
        const next = makeNext()
        middleware(req, makeMockRes(), next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<Child>(req)!
        expect(dto.name).toBe('Alice')
        expect(dto.nickname).toBeNull()
    })

    it('should bind fields across multi-level inheritance', () => {
        // Three levels of inheritance: all fields from each ancestor
        // must be bound correctly on the leaf class.
        class GrandParent {
            @Body() a!: string
        }
        class Parent extends GrandParent {
            @Body() b!: string
        }
        class Child extends Parent {
            @Body() c!: string
        }

        const middleware = bindingCargo(Child)
        const req = makeMockReq({
            body: { a: 'A', b: 'B', c: 'C' },
        })
        const next = makeNext()
        middleware(req, makeMockRes(), next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<Child>(req)!
        expect(dto.a).toBe('A')
        expect(dto.b).toBe('B')
        expect(dto.c).toBe('C')
    })
})
