# Virtual Field Decorators

**Express-Cargo** provides decorators to define **virtual fields** and **request-derived fields**. These decorators allow you to compute values dynamically or map data from the `Request` directly into the Object property.

## Built-in Virtual Decorators

### `@Virtual<T>(transformer: (obj: object) => T)`

The `@Virtual` decorator defines a **computed property** that is not directly sourced from the request. Instead, its value is derived from other properties of the object.

- **`transformer`**: A function that receives the object instance and returns the computed value

### `@Request<T>(transformer: (req: Request) => T)`

The `@Request` decorator maps a value from the Express `Request` object into a class property.

- **`transformer`**: A function that receives the Request object and returns the value to bind.

`@Request` assigns the returned value as-is, without built-in type casting. A common use case is binding an authenticated user that another middleware, such as Passport.js, has placed on `req.user`.

## Choosing Between Them

`@Virtual` and `@Request` belong to two separate categories, and a field takes exactly one of them. Applying both raises `@Request cannot be combined with @Virtual` when the route is registered, and pairing either one with a source decorator such as `@Body` is rejected the same way — the three answer the same question of where a field's value comes from.

- Reach for `@Request` when the value lives on the raw `Request` object, before any of the object's own fields are bound.
- Reach for `@Virtual` when the value is derived from other fields of the object being built.

`@Virtual` runs after every source field is bound, so it can read those fields no matter which order they are declared in. Only a `@Virtual` field that depends on another `@Virtual` field is order-sensitive.

## Usage Example

```typescript
import express from 'express'
import passport from 'passport'
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { Body, Virtual, Request, bindingCargo, getCargo } from 'express-cargo'

class OrderExample {
    @Body('price')
    price!: number

    @Body('quantity')
    quantity!: number

    // Computed field not present in the request
    @Virtual((obj: OrderExample) => obj.price * obj.quantity)
    total!: number
}

class PassportExample {
    @Request<object>(req => req.user!)
    user!: object
}

const EXAMPLE_TOKEN = 'express-cargo-token'

passport.use(
    new BearerStrategy((token, done) => {
        if (token !== EXAMPLE_TOKEN) {
            return done(null, false)
        }

        return done(null, { id: 'test-user-id', role: 'admin' })
    }),
)

const app = express()
app.use(express.json())
app.use(passport.initialize())

app.post('/orders', bindingCargo(OrderExample), (req, res) => {
    const orderData = getCargo<OrderExample>(req)
    res.json({
        message: 'Order data processed with virtual fields!',
        data: orderData,
    })
})

app.get('/passport', passport.authenticate('bearer', { session: false }), bindingCargo(PassportExample), (req, res) => {
    const cargo = getCargo<PassportExample>(req)
    res.json(cargo)
})
```

Passport authentication must run before `bindingCargo()`. When authentication succeeds, Passport sets `req.user`, and `@Request<object>` binds that object to `PassportExample.user`. Missing or invalid credentials are rejected by Passport before cargo binding runs.

```shell
curl 'http://localhost:3000/passport' \
    -H 'Authorization: Bearer express-cargo-token'
```

```json
{
    "user": {
        "id": "test-user-id",
        "role": "admin"
    }
}
```

Using `object` keeps the example independent of an application's user model. If application code needs properties such as `user.id`, replace `object` with a concrete user type and pass that type to `@Request<T>`.
