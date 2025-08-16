# Validation Decorators

Express-Cargo uses decorators to validate incoming request data that is bound to a class.

Validation is not performed by a standalone `validate` function. Instead, it is integrated into the `bindingCargo` middleware, which automatically validates data during the request lifecycle.

## Built-in Validators

### `@min(value: number)`

Checks if a number is greater than or equal to the specified minimum value.

- **`value`**: The minimum allowed value.

### `@max(value: number)`

Checks if a number is less than or equal to the specified maximum value.

- **`value`**: The maximum allowed value.

### `@prefix(value: string)`

Checks if a string starts with the specified prefix.

- **`value`**: The required starting text.

### `@suffix(value: string)`

Checks if a string ends with the specified suffix.

- **`value`**: The required ending text.

### `@equal(value: any)`

Validates that the input value is strictly equal (`===`) to the specified value. 

- **`value`**: The value to compare against.

### `@notEqual(value: any)`

Validates that the input value is strictly not equal (`!==`) to the specified value.

- **`value`**: The value to compare against.

### `@isTrue()`

Validates that the decorated property is true.

## Usage Example

Here is a complete example of how to use validation decorators within an Express application.

```typescript
import express, { Request, Response, NextFunction } from 'express'
import { bindingCargo, getCargo, body, min, max, suffix, CargoValidationError } from 'express-cargo'

// 1. Define a class with source and validation rules
class CreateAssetRequest {
    @body('name')
    assetName!: string

    @body('type')
    @suffix('.png')
    assetType!: string

    @body('quantity')
    @min(1)
    @max(100)
    quantity!: number
}

const app = express()
app.use(express.json())

// 2. Apply the bindingCargo middleware to a route
app.post('/assets', bindingCargo(CreateAssetRequest), (req: Request, res: Response) => {
    // 3. If validation succeeds, access the data using getCargo
    const assetData = getCargo<CreateAssetRequest>(req)
    res.json({
        message: 'Asset created successfully!',
        data: assetData,
    })
})

// 4. Add an error handling middleware to catch validation errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        res.status(400).json({
            message: 'Validation Failed',
            errors: err.errors.map(e => e.message),
        })
    } else {
        next(err)
    }
})

/*
To test this endpoint, send a POST request to /assets.

Example of a VALID request body:
{
    "name": "My-Asset",
    "type": "icon.png",
    "quantity": 10
}

Example of an INVALID request body:
{
    "name": "My-Asset",
    "type": "icon.jpg", // Fails @suffix('.png')
    "quantity": 101     // Fails @max(100)
}
*/
```

## Error Handling

When validation fails, the `bindingCargo` middleware throws a `CargoValidationError`. You should register an Express error handling middleware to catch this error and format the response.

The `CargoValidationError` object has an `errors` property, which holds an array of `CargoFieldError` instances. Each `CargoFieldError` object contains a `message` property with a formatted string detailing the specific error (e.g., `"quantity: quantity must be <= 100"`).

As shown in the code example, a common way to handle this is to map over the `err.errors` array to create a simple list of these error messages.

**Example Error Response:**

When the invalid request body from the example above is sent, the error handler will produce the following JSON response, which contains an array of formatted error messages.

```json
{
    "message": "Validation Failed",
    "errors": [
        "type: assetType must end with .png",
        "quantity: quantity must be <= 100"
    ]
}
```
