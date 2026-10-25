import {
    bindingCargo,
    Body,
    CargoFieldError,
    CargoValidationError,
    Each,
    getCargo,
    Header,
    List,
    ListMinSize,
    Min,
    MinLength,
    Optional,
    Query,
    Transform,
    Type,
    Virtual,
} from '../../src'
import { makeMockReq, makeMockRes, makeNext } from './testUtils'

class Item {
    @Body() @MinLength(3) sku!: string
    @Body() @Min(1) quantity!: number
}

class Customer {
    @Body() @MinLength(2) name!: string
    @Virtual((customer: Customer) => {
        if (customer.name === 'boom') throw new Error('cannot compute')
        return customer.name
    })
    label!: string
}

class OrderDTO {
    @Header('x-request-id') @MinLength(8) requestId!: string
    @Body() @Type(() => Customer) customer!: Customer
    @Body() @List(Item) @ListMinSize(2) items!: Item[]
    @Body() @Min(1) count!: number
    @Query() @Optional() @List('number') @Each(Min(1)) nums!: number[]
}

const validBody = () => ({
    customer: { name: 'Alice' },
    items: [
        { sku: 'abc', quantity: 1 },
        { sku: 'def', quantity: 2 },
    ],
    count: 1,
})
const validHeaders = { 'x-request-id': 'req-12345' }

function bindErrors(options: Parameters<typeof makeMockReq>[0]): { field: string; message: string }[] {
    const req = makeMockReq({ headers: validHeaders, ...options })
    const next = makeNext()
    bindingCargo(OrderDTO)(req, makeMockRes(), next)

    const err = next.mock.calls[0][0]
    expect(err).toBeInstanceOf(CargoValidationError)
    return (err as CargoValidationError).errors.map(e => ({ field: String(e.field), message: e.message }))
}

describe('error field naming', () => {
    it('prefixes validator errors inside nested objects and list elements with their path', () => {
        const body = validBody()
        body.customer.name = 'A'
        body.items[1] = { sku: 'x', quantity: 0 }

        const fields = bindErrors({ body }).map(e => e.field)

        expect(fields).toEqual(['customer.name', 'items[1].sku', 'items[1].quantity'])
    })

    it('uses the same path for missing-value and validator errors', () => {
        const body = validBody()
        delete (body.items[0] as Partial<Item>).sku
        body.items[1].sku = 'x'

        expect(bindErrors({ body }).map(e => e.field)).toEqual(['items[0].sku', 'items[1].sku'])
    })

    it('reports an aliased header under its source key whether it is missing or invalid', () => {
        expect(bindErrors({ body: validBody(), headers: {} }).map(e => e.field)).toEqual(['x-request-id'])
        expect(bindErrors({ body: validBody(), headers: { 'x-request-id': 'short' } }).map(e => e.field)).toEqual(['x-request-id'])
    })

    it('prefixes virtual field errors inside nested objects with their path', () => {
        const body = validBody()
        body.customer.name = 'boom'

        expect(bindErrors({ body })).toEqual([{ field: 'customer.label', message: 'Error while computing virtual field: cannot compute' }])
    })
})

describe('cast failures', () => {
    it('reports a failed number cast once instead of repeating it for each validator', () => {
        expect(bindErrors({ body: { ...validBody(), count: 'abc' } })).toEqual([{ field: 'count', message: 'count must be a valid number' }])
    })

    it('reports a failed element cast once instead of repeating it for @Each', () => {
        expect(bindErrors({ body: validBody(), query: { nums: ['1', 'x'] } })).toEqual([
            { field: 'nums[1]', message: 'nums[1] must be a valid number' },
        ])
    })

    it('keeps list-level validator errors when an element fails', () => {
        const fields = bindErrors({ body: { ...validBody(), items: [{ sku: 'x', quantity: 1 }] } }).map(e => e.field)

        expect(fields).toEqual(expect.arrayContaining(['items[0].sku', 'items']))
    })

    it('reports cast errors as plain CargoFieldError instances', () => {
        const req = makeMockReq({ headers: validHeaders, body: { ...validBody(), count: 'abc' } })
        const next = makeNext()
        bindingCargo(OrderDTO)(req, makeMockRes(), next)

        expect((next.mock.calls[0][0] as CargoValidationError).errors).toStrictEqual([new CargoFieldError('count', 'count must be a valid number')])
    })

    it('skips the transformer when casting fails instead of passing it undefined', () => {
        class TransformedDTO {
            @Body() @Transform((value: number) => Number(value.toFixed(1))) ratio!: number
            @Body() @Type(() => Item) @Transform((item: Item) => ({ ...item, sku: item.sku.toUpperCase() })) item!: Item
        }

        const req = makeMockReq({ body: { ratio: 'abc', item: 'str' } })
        const next = makeNext()
        bindingCargo(TransformedDTO)(req, makeMockRes(), next)

        const err = next.mock.calls[0][0]
        expect(err).toBeInstanceOf(CargoValidationError)
        expect((err as CargoValidationError).errors.map(e => e.field)).toEqual(['ratio', 'item'])
    })
})

describe('nested object values', () => {
    it.each([
        ['a string', 'str'],
        ['a number', 1],
        ['an array', []],
    ])('rejects %s for a @Type field', (_label, customer) => {
        expect(bindErrors({ body: { ...validBody(), customer } })).toEqual([{ field: 'customer', message: 'customer must be an object' }])
    })

    it('rejects list elements that are not objects', () => {
        const body = { ...validBody(), items: [1, null, [], { sku: 'abc', quantity: 1 }] }

        expect(bindErrors({ body }).map(e => e.field)).toEqual(['items[0]', 'items[1]', 'items[2]'])
    })

    it('rejects an array for a polymorphic @Type field whose design type is a union', () => {
        class Photo {
            @Body() url!: string
        }
        class Video {
            @Body() length!: number
        }
        class PostDTO {
            @Body() @Type((data: any) => (data?.length !== undefined ? Video : Photo)) content!: Photo | Video
        }

        const req = makeMockReq({ body: { content: [] } })
        const next = makeNext()
        bindingCargo(PostDTO)(req, makeMockRes(), next)

        const err = next.mock.calls[0][0] as CargoValidationError
        expect(err.errors.map(e => ({ field: e.field, message: e.message }))).toEqual([{ field: 'content', message: 'content must be an object' }])
    })

    it('passes primitives and arrays through to @Transform when the class only comes from the property type', () => {
        class Money {
            constructor(readonly amount: unknown) {}
        }
        class PriceDTO {
            @Body() @Transform((value: any) => new Money(value)) price!: Money
            @Body() @Transform((value: any) => new Money(value)) prices!: Money
        }

        const req = makeMockReq({ body: { price: 100, prices: [1, 2] } })
        const next = makeNext()
        bindingCargo(PriceDTO)(req, makeMockRes(), next)

        expect(next).toHaveBeenCalledWith()
        const dto = getCargo<PriceDTO>(req)
        expect(dto.price).toEqual(new Money(100))
        expect(dto.prices).toEqual(new Money([1, 2]))
    })
})
