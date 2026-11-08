import type { Scenario } from './types'

export type ValidRequest = {
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

export type ValidResponse = {
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

export const validScenario: Scenario<ValidRequest, ValidResponse> = {
    name: 'valid',
    route: '/valid/orders/:id',
    path: '/valid/orders/42?active=true',
    requestId: 'request-123',
    body: {
        name: ' Alice ',
        email: 'alice@example.com',
        age: '35',
        role: 'user',
        items: [
            { sku: 'SKU-001', quantity: '2', price: '12.5' },
            { sku: 'SKU-002', quantity: '1', price: '3' },
        ],
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
        itemCount: 2,
        total: 28,
    },
}
