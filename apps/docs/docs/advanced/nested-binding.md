# Nested Object Binding

Express-Cargo allows you to handle nested objects in requests, automatically binding them to nested object while supporting recursive type casting and validation.

## Usage Example

```typescript
import express, { Request, Response } from 'express'
import { Body, bindingCargo, getCargo } from 'express-cargo'

// 1. Define nested Object
class Profile {
    @Body('nickname')
    nickname!: string
}

class ExampleObject {
    @Body('profile')
    profile!: Profile
}

// 2. Setup Express app and route
const app = express()
app.use(express.json())

app.post('/submit', bindingCargo(ExampleObject), (req: Request, res: Response) => {
    const requestData = getCargo<ExampleObject>(req)

    res.json({
        message: 'Nested bound successfully!',
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

When a POST request with a nested profile object is sent, the `bindingCargo` middleware automatically instantiates and validates the nested `ExampleObject`. The `getCargo` function then returns a fully populated object with the nested data:

```json
{
    "message": "Nested bound successfully!",
    "data": {
        "profile": {
            "nickname": "coder123"
        }
    }
}
```
