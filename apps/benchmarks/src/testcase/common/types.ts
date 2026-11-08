/** What every library's parser must produce from a request, whichever scenario sent it. */

export type OrderItemRequest = {
    sku: string
    quantity: number
    price: number
}

export type OrderRequest = {
    id: number
    active: boolean
    requestId: string
    name: string
    email: string
    age: number
    role: string
    items: OrderItemRequest[]
}
