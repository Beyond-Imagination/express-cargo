# Handling Nested Requests

This example demonstrates how **Express-Cargo** can populate nested Requests, allowing you to map complex, structured request data into a single, well-organized object.

## 1. Define Your Requests

In this scenario, we'll define two classes: `UserInfoRequest` and `OrderRequest`. The `UserInfoRequest` class pulls user details from the request body and an authentication token from the headers.

**`UserInfoRequest`** – Maps user details from the request body and extracts the authorization token from headers.

```typescript
// user.request.ts
import { Body, Header, Optional, prefix, Transform } from 'express-cargo'

export class UserInfoRequest {
    @Body('name')
    name!: string

    @Body('email')
    @prefix('user-')
    email!: string

    @Body('age')
    @Optional()
    age?: number

    // Extract the token from the Authorization header.
    @Header('authorization')
    @Transform((value: string) => {
        if (value.startsWith('Bearer ')) {
            return value.substring(7);
        }
        return ''
    })
    authorization!: string
}
```

**`OrderRequest`** – Represents an order request, including a nested `UserInfoRequest`.

```typescript
// order.request.ts
import { Body, min, max } from 'express-cargo'
import { UserInfoRequest } from './user.Request'

export class OrderRequest {
    @Body('productId')
    productId!: string

    @Body('quantity')
    @min(1)
    @max(10)
    quantity!: number

    @Body('user')
    user!: UserInfoRequest
}
```

In `UserInfoRequest`, we use the `@header` decorator on the `authorization` property to get the value from the `Authorization` header. Then, the `@transform` decorator extracts just the token value, stripping the `"Bearer "` prefix.

## 2. Use in an Express Route

Simply apply the `bindingCargo` middleware to your route with the top-level Request, `OrderRequest`. The middleware will handle all the binding logic for you.

```typescript
router.post('/orders', bindingCargo(OrderRequest), (req, res) => {
    const order = getCargo<OrderRequest>(req)

    if (order) {
        console.log(`Processing order for product: ${order.productId}`)
        console.log(`User name: ${order.user.name}`)
        console.log(`Auth token: ${order.user.authorization}`)

        // You can now use the auth token for validation or other logic.
        res.json({ message: 'Order received', order })
    }
})
```

## 3. Example Request

This route will successfully process a request that has both a body and an `Authorization` header.

- Request Body:
    ```json
    {
        "productId": "SKU-456",
        "quantity": 5,
        "user": {
            "name": "Jane Doe",
            "email": "user-jane@example.com"
        }
    }
    ```

- Request Headers:

    ```
    Authorization: Bearer my-auth-token-12345
    ```

When processed, `getCargo(req)` will return a single `OrderRequest` object that contains all the data, with the `authorization` property correctly populated from the header. This demonstrates how **Express-Cargo** elegantly unifies multiple data sources into one clean object.

## 4. Example Result

Final bound `OrderRequest` object:

```json
{
    "productId": "SKU-456",
    "quantity": 5,
    "user": {
        "name": "Jane Doe",
        "email": "user-jane@example.com",
        "authorization": "my-auth-token-12345"
    }
}
```
