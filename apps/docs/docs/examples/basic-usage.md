# Basic Usage

This example shows the simplest end-to-end flow of **express-cargo**: define a request class, bind it with the `bindingCargo` middleware, and read the validated result with `getCargo`.

> This page focuses on the binding flow only. For project setup (TypeScript, `tsconfig`, installing dependencies), see [Getting Started](../getting-started.md).

## 1. Define a Request Class

Declare a class and use a source decorator (here `@Body()`) to map each field to a part of the incoming request.

```typescript
// create-user.request.ts
import { Body } from 'express-cargo'

export class CreateUserRequest {
    @Body('name')
    name!: string

    @Body('email')
    email!: string
}
```

## 2. Apply the Middleware

Pass the request class to `bindingCargo` and register it as middleware on the route. The middleware binds and validates the request before your handler runs.

```typescript
import express from 'express'
import { bindingCargo, getCargo } from 'express-cargo'
import { CreateUserRequest } from './create-user.request'

const app = express()
app.use(express.json())

app.post('/users', bindingCargo(CreateUserRequest), (req, res) => {
    // 3. Read the bound, type-safe object
    const user = getCargo<CreateUserRequest>(req)

    res.json({
        message: 'User created!',
        data: user,
    })
})
```

## 3. Example Request

```json
{
    "name": "Jane Doe",
    "email": "jane@example.com"
}
```

## 4. Example Result

`getCargo<CreateUserRequest>(req)` returns a fully populated instance of `CreateUserRequest`:

```json
{
    "message": "User created!",
    "data": {
        "name": "Jane Doe",
        "email": "jane@example.com"
    }
}
```

## Next Steps

- Pull data from other sources (`@Query`, `@Header`, `@Params`) — see [Source Decorators](../decorators/source-decorators.md)
- Add validation rules such as `@Min`, `@Email` — see [Validation Decorators](../decorators/validators.md)
- Bind nested objects — see [Handling Nested Requests](./nested-request.md)
- Handle validation failures — see [Error Handling](./validation-errors.md)
