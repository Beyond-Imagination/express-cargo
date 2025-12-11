# Validation Decorators

Express-Cargo uses decorators to validate incoming request data that is bound to a class.

Validation is not performed by a standalone `validate` function. Instead, it is integrated into the `bindingCargo` middleware, which automatically validates data during the request lifecycle.

## Built-in Validators

### `@Optional()`

Marks a field as optional, allowing it to be omitted or set to `undefined` without triggering validation errors.

### `@min(value: number)`

Validates that a number is greater than or equal to the specified minimum value.

- **`value`**: The minimum allowed value.

### `@max(value: number)`

Validates that a number is less than or equal to the specified maximum value.

- **`value`**: The maximum allowed value.

### `@range(min: number, max: number)`

Validates that a number is within the specified range, inclusive of the minimum and maximum values.

- **`min`**: The minimum allowed value.
- **`max`**: The maximum allowed value.

### `@prefix(value: string)`

Validates that a string starts with the specified prefix.

- **`value`**: The required starting text.

### `@suffix(value: string)`

Validates that a string ends with the specified suffix.

- **`value`**: The required ending text.

### `@equal(value: any)`

Validates that a value is strictly equal (`===`) to the specified value.

- **`value`**: The value to compare against.

### `@notEqual(value: any)`

Validates that a value is strictly not equal (`!==`) to the specified value.

- **`value`**: The value to compare against.

### `@isTrue()`

Validates that the decorated property is true.

### `@isFalse()`

Validates that the decorated property is false.

### `@length(value: number)`

Validates that the decorated string’s length is exactly the specified value.

- **`value`**: The required exact length in characters

### `@maxLength(value: number)`

Validates that the decorated string’s length does not exceed the specified maximum.

- **`value`**: The maximum allowed length in characters.

### `@minLength(value: number)`

Validates that the decorated string’s length is at least the specified minimum.

- **`value`**: The minimum allowed length in characters.

### `@oneOf(values: any[])`

Validates that the input value is one of the specified values.

- **`values`**: The array of allowed values.

### `@validate(validateFn: (value: unknown) => boolean, message?: string)`

Validates a value using a custom validation function.
This decorator provides flexibility to implement validation logic beyond the built-in ones.

- **`validateFn`**: A function that receives the field value and returns true if valid, false otherwise.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@regexp(pattern: RegExp, message?: string)`

Validates that the decorated field matches the specified regular expression pattern.
This decorator is useful for enforcing format rules such as email, phone numbers, etc.

- **`pattern`**: A RegExp object used to test the field value. The value is valid if it matches the pattern.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@email()`

Validates that the decorated property is a valid email address.

### `isAlpha(message?: string)`

Validates that the decorated field contains alphabetic characters only (uppercase or lowercase English letters, A–Z / a–z).

- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `With(fieldName: string, message?: string)`

Validates that if the decorated field has a value, the specified target field (fieldName) must also have a value, establishing a mandatory dependency between the two fields.

- **`fieldName`**: The name of the target field that must also have a value if the decorated field has a value.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

## Usage Example

Here is a complete example of how to use validation decorators within an Express application.

```typescript
import express, { Request, Response, NextFunction } from 'express'
import { bindingCargo, getCargo, Body, min, max, suffix, CargoValidationError } from 'express-cargo'

// 1. Define a class with source and validation rules
class CreateAssetRequest {
    @Body('name')
    assetName!: string

    @Body('type')
    @suffix('.png')
    assetType!: string

    @Body('quantity')
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
