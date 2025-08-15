# Handling Nested Requests

This example demonstrates how **Express-Cargo** can populate nested DTOs, allowing you to map complex, structured request data into a single, well-organized object.

## 1. Define Your DTOs

In this scenario, we'll define two classes: `UserInfoDto` and `OrderDto`. The `UserInfoDto` class pulls user details from the request body and an authentication token from the headers.

**`UserInfoDto`** – Maps user details from the request body and extracts the authorization token from headers.

```typescript
// user.dto.ts
import { body, header, optional, prefix, transform } from 'express-cargo'

export class UserInfoDto {
    @body('name')
    name!: string

    @body('email')
    @prefix('user-')
    email!: string

    @body('age')
    @optional()
    age?: number

    // Extract the token from the Authorization header.
    @header('authorization')
    @transform((value: string) => {
        const parts = value.split(' ')
        if (parts.length === 2 && parts[0] === 'Bearer') {
            return parts[1]
        }
        return ''
    })
    authorization!: string
}
```

**`OrderDto`** – Represents an order request, including a nested `UserInfoDto`.

```typescript
// order.dto.ts
import { body, min, max } from 'express-cargo'
import { UserInfoDto } from './user.dto'

export class OrderDto {
    @body('productId')
    productId!: string

    @body('quantity')
    @min(1)
    @max(10)
    quantity!: number

    @body('user')
    user!: UserInfoDto
}
```

In `UserInfoDto`, we use the `@header` decorator on the `authorization` property to get the value from the `Authorization` header. Then, the `@transform` decorator extracts just the token value, stripping the `"Bearer "` prefix.

## 2. Use in an Express Route

Simply apply the `bindingCargo` middleware to your route with the top-level DTO, `OrderDto`. The middleware will handle all the binding logic for you.

```typescript
router.post('/orders', bindingCargo(OrderDto), (req, res) => {
    const order = getCargo<OrderDto>(req)

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

When processed, `getCargo(req)` will return a single `OrderDto` object that contains all the data, with the `authorization` property correctly populated from the header. This demonstrates how **Express-Cargo** elegantly unifies multiple data sources into one clean object.

## 4. Example Result

Final bound `OrderDto` object:

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
