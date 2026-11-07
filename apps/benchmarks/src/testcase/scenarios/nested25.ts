import type { Scenario } from './types'

export type Nested25Request = {
    path: string
    requestId: string
    body: {
        name: string
        email: string
        age: string
        role: string
        items: { sku: string; quantity: string; price: string }[]
    }
}

export type Nested25Response = {
    id: number
    active: boolean
    requestId: string
    name: string
    email: string
    age: number
    role: string
    itemCount: number
    total: number
}

export const nested25Scenario: Scenario<Nested25Request, Nested25Response> = {
    name: 'nested 25 valid',
    route: '/nested-25/orders/:id',
    path: '/nested-25/orders/42?active=true',
    requestId: 'request-123',
    body: {
        name: ' Alice ',
        email: 'alice@example.com',
        age: '35',
        role: 'user',
        items: Array.from({ length: 25 }, (_, index) => ({
            sku: `SKU-${String(index).padStart(3, '0')}`,
            quantity: '2',
            price: '12.5',
        })),
    },
    status: 200,
    response: {
        id: 42,
        active: true,
        requestId: 'request-123',
        name: 'Alice',
        email: 'alice@example.com',
        age: 35,
        role: 'user',
        itemCount: 25,
        total: 625,
    },
}
