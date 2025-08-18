# Virtual Field Decorators

**Express-Cargo** provides decorators to define **virtual fields** and **request-derived fields**. These decorators allow you to compute values dynamically or map data from the `Request` directly into the Object property.

## Built-in Virtual Decorators

### `@virtual<T>(transformer: (obj: object) => T)`

The `@virtual` decorator defines a **computed property** that is not directly sourced from the request. Instead, its value is derived from other properties of the object.

- **`transformer`**: A function that receives the object instance and returns the computed value

### `@request<T>(transformer: (req: Request) => T)`

The `@request` decorator maps a value from the Express `Request` object into a class property.

- **`transformer`**: A function that receives the Request object and returns the value to bind.

## Usage Example

```typescript
import express, { Request, Response } from 'express'
import { body, virtual, request, bindingCargo, getCargo } from 'express-cargo'

// 1. Define Object with virtual and request-derived fields
class OrderExample {
    @body('price')
    price!: number

    @body('quantity')
    quantity!: number

    // Computed field not present in the request
    @virtual((obj: OrderExample) => obj.price * obj.quantity)
    total!: number
}

class HeaderExample {
    // Field derived directly from the request object
    @request((req: Request) => req.headers['x-custom-header'] as string)
    customHeader!: string
}

// 2. Setup Express app and route
const app = express()
app.use(express.json())

app.post('/orders', bindingCargo(OrderExample), (req: Request, res: Response) => {
    const orderData = getCargo<OrderExample>(req)
    res.json({
        message: 'Order data processed with virtual fields!',
        data: orderData
    })
})

app.post('/headers', bindingCargo(HeaderExample), (req: Request, res: Response) => {
    const headerData = getCargo<HeaderExample>(req)
    res.json({
        message: 'Header data mapped using @request!',
        data: headerData
    })
})

/*
To test these endpoints, send POST requests with the relevant body or headers:

Example /orders body:
{
    "price": 50,
    "quantity": 2
}

Example /headers headers:
x-custom-header: my-header-value
*/
```
