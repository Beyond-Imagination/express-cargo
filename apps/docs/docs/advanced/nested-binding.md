# Nested DTO Binding

Express-Cargo allows you to handle nested objects in requests, automatically binding them to nested DTOs while supporting recursive type casting and validation.

## Usage Example

```typescript
import express, { Request, Response } from 'express'
import { body, bindingCargo, getCargo } from 'express-cargo'

// 1. Define nested DTOs
class Profile {
    @body('nickname')
    nickname!: string
}

class RequestDto {
    @body('profile')
    profile!: Profile
}

// 2. Setup Express app and route
const app = express()
app.use(express.json())

app.post('/submit', bindingCargo(RequestDto), (req: Request, res: Response) => {
    const requestData = getCargo<RequestDto>(req)

    res.json({
        message: 'Nested DTO bound successfully!',
        data: requestData,
    })
})

/*
To test this endpoint, send a POST request to /submit.

Example request URL:
http://localhost:3000/submit
*/
```

## Output Example

When a POST request with a nested profile object is sent, the `bindingCargo` middleware automatically instantiates and validates the nested `Profile` DTO. The `getCargo` function then returns a fully populated object with the nested data:

```json
{
    "message": "Nested DTO bound successfully!",
    "data": {
        "profile": {
            "nickname": "coder123"
        }
    }
}
```
