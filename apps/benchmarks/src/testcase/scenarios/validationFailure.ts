import type { Scenario } from './types'

export type ValidationFailureRequest = {
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

export type ValidationFailureResponse = {
    error: string
}

export const validationFailureScenario: Scenario<ValidationFailureRequest, ValidationFailureResponse> = {
    name: 'validation failure',
    route: '/validation-failure/orders/:id',
    path: '/validation-failure/orders/0?active=false',
    requestId: 'x',
    body: {
        name: ' x ',
        email: 'bad',
        age: '17',
        role: 'root',
        items: [{ sku: 'x', quantity: '0', price: '0' }],
    },
    status: 400,
    response: { error: 'invalid request' },
}
