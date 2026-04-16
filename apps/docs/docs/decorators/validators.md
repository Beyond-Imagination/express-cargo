# Validation Decorators

Express-Cargo uses decorators to validate incoming request data that is bound to a class.

Validation is not performed by a standalone `validate` function. Instead, it is integrated into the `bindingCargo` middleware, which automatically validates data during the request lifecycle.

## Built-in Validators

### `@Optional()`

Marks a field as optional, allowing it to be omitted or set to `undefined` without triggering validation errors.

### `@Min(value: number)`

Validates that a number is greater than or equal to the specified minimum value.

- **`value`**: The minimum allowed value.

### `@Max(value: number)`

Validates that a number is less than or equal to the specified maximum value.

- **`value`**: The maximum allowed value.

### `@Range(min: number, max: number)`

Validates that a number is within the specified range, inclusive of the minimum and maximum values.

- **`min`**: The minimum allowed value.
- **`max`**: The maximum allowed value.

### `@Contains(seed: string)`

Validates that the string contains the specified substring.

- **`seed`**: The substring that must be present in the string.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@Prefix(value: string)`

Validates that a string starts with the specified prefix.

- **`value`**: The required starting text.

### `@Suffix(value: string)`

Validates that a string ends with the specified suffix.

- **`value`**: The required ending text.

### `@Equal(value: any)`

Validates that a value is strictly equal (`===`) to the specified value.

- **`value`**: The value to compare against.

### `@NotEqual(value: any)`

Validates that a value is strictly not equal (`!==`) to the specified value.

- **`value`**: The value to compare against.

### `@IsTrue()`

Validates that the decorated property is true.

### `@IsFalse()`

Validates that the decorated property is false.

### `@Length(value: number)`

Validates that the decorated string’s length is exactly the specified value.

- **`value`**: The required exact length in characters

### `@MaxLength(value: number)`

Validates that the decorated string’s length does not exceed the specified maximum.

- **`value`**: The maximum allowed length in characters.

### `@MinLength(value: number)`

Validates that the decorated string’s length is at least the specified minimum.

- **`value`**: The minimum allowed length in characters.

### `@OneOf(values: any[])`

Validates that the input value is one of the specified values.

- **`values`**: The array of allowed values.

### `@ListContains(values: any[], comparator?: (expected, actual) => boolean, message?: string)`

Validates that the array contains all the specified values. Supports primitive values, objects, Date, and mixed types.

- **`values`**: The values that must be present in the array.
- **`comparator`** (optional): A custom comparison function `(expected, actual) => boolean`. When provided, all comparisons are delegated to this function, including primitives.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

> **Warning**: Object comparison uses deep equality by default. Performance may degrade when `values` contains many objects or deeply nested structures. Consider using a `comparator` for more efficient or flexible comparison.

### `@ListNotContains(values: any[], comparator?: (expected, actual) => boolean, message?: string)`

Validates that the array does NOT contain any of the specified values. Supports primitive values, objects, Date, and mixed types.

- **`values`**: The values that must NOT be present in the array.
- **`comparator`** (optional): A custom comparison function `(expected, actual) => boolean`. When provided, all comparisons are delegated to this function, including primitives.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

> **Warning**: Object comparison uses deep equality by default. Performance may degrade when `values` contains many objects or deeply nested structures. Consider using a `comparator` for more efficient or flexible comparison.

### `@Enum(enumObj: object, message?: string)`

Validates that the input value matches one of the values in the specified enum object.
It also automatically transforms the input value (e.g., string key) to the corresponding enum value.

- **`enumObj`**: The enum object to validate against.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@Validate(validateFn: (value: unknown) => boolean, message?: string)`

Validates a value using a custom validation function.
This decorator provides flexibility to implement validation logic beyond the built-in ones.

- **`validateFn`**: A function that receives the field value and returns true if valid, false otherwise.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@Regexp(pattern: RegExp, message?: string)`

Validates that the decorated field matches the specified regular expression pattern.
This decorator is useful for enforcing format rules such as email, phone numbers, etc.

- **`pattern`**: A RegExp object used to test the field value. The value is valid if it matches the pattern.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@Email()`

Validates that the decorated property is a valid email address.

### `@Alpha(message?: string)`

Validates that the decorated field contains alphabetic characters only (uppercase or lowercase English letters, A–Z / a–z).

- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@Uuid(version?: 'v1' | 'v3' | 'v4' | 'v5', message?: string)`

Validates that the decorated field is a valid UUID string, optionally restricted to a specific version (v1, v3, v4, or v5).

- **`version`** (optional): The specific UUID version to validate against. If omitted, it validates against v1, v3, v4, or v5.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@Alphanumeric(message?: string)`

Validates that the decorated field contains alphanumeric characters only (English letters and digits, A–Z, a–z, 0–9).

- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@IsUppercase(message?: string)`

Validates that the decorated field contains only uppercase characters.

- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@IsLowercase(message?: string)`

Validates that the decorated field contains only lowercase characters.

- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@IsJwt(message?: string)`

Validates that the decorated field follows the JWT format (`header.payload.signature`). Each part must consist of Base64URL characters (A-Z, a-z, 0-9, `-`, `_`). This decorator only checks the format — it does not verify the signature or token validity.

- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@IsUrl(options?: IsUrlOptions, message?: string)`

Validates that the decorated field is a valid URL. By default, `http`, `https`, and `ftp` protocols are allowed.

- **`options`** (optional):
  - **`protocols`**: An array of allowed protocols. Defaults to `['http', 'https', 'ftp']`.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@IsPhoneNumber(region?: CountryCode, message?: string)`

Validates that the decorated field is a valid phone number. Uses [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) for accurate validation across all countries.

When a region is provided, local formats (without country code) are accepted. When no region is provided, the number must include a country code (e.g., `+82`). If the number includes a `+` country code prefix, the region parameter is ignored and the number is validated against its own country code.

- **`region`** (optional): ISO 3166-1 alpha-2 region code (e.g., `'KR'`, `'US'`). If omitted, the number must be in international format.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@IsTimeZone(message?: string)`

Validates that the decorated field is a valid IANA timezone identifier (e.g., `Asia/Seoul`, `America/New_York`, `UTC`). Uses the built-in `Intl` API for validation — no external dependencies required.

- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@IsHexColor(message?: string)`

Validates that the decorated field is a valid hex color code. Supports `#RGB`, `#RGBA`, `#RRGGBB`, and `#RRGGBBAA` formats (case-insensitive). The `#` prefix is required.

- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@IsHexadecimal(message?: string)`

Validates that the decorated field is a hexadecimal number. The value must contain only characters `0-9` and `a-f` (case-insensitive). The `0x` prefix is also allowed.

- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@IsHash(algorithm: HashAlgorithm, message?: string)`

Validates that the decorated field is a valid hash string for the given algorithm. Supported algorithms: `md5`, `sha1`, `sha256`, `sha384`, `sha512`, `crc32`, `crc32b`. The value must be a hexadecimal string with the exact length required by the algorithm.

- **`algorithm`**: The hash algorithm to validate against.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@MinDate(min: Date | (() => Date), message?: string)`

Validates that the decorated field is a `Date` that is on or after the given minimum date. Accepts a fixed `Date` or a function that returns a `Date` for dynamic comparison.

- **`min`**: The minimum allowed date, or a function that returns it.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@MaxDate(max: Date | (() => Date), message?: string)`

Validates that the decorated field is a `Date` that is on or before the given maximum date. Accepts a fixed `Date` or a function that returns a `Date` for dynamic comparison.

- **`max`**: The maximum allowed date, or a function that returns it.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@With(fieldName: string, message?: string)`

Validates that if the decorated field has a value, the specified target field (fieldName) must also have a value, establishing a mandatory dependency between the two fields.

- **`fieldName`**: The name of the target field that must also have a value if the decorated field has a value.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@Without(fieldName: string, message?: string)`

Validates that if the decorated property has a value, the specified target property must NOT have a value, establishing a mutually exclusive relationship between the two properties.

- **`fieldName`**: The name of the target property that must be empty if the decorated field has a value.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@Each(...args: (Validator | Function)[])`

Validates every individual element within an array. It can accept other validation decorators or custom validation functions.

- `args`: A validation decorator (e.g., @Min(5)) or a custom function (value: any) => boolean.

### `@ListMaxSize(max: number, message?: string)`

Validates that the array contains no more than the specified number of elements.

- **`max`**: The maximum number of elements allowed in the array.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

### `@ListMinSize(min: number, message?: string)`

Validates that the array contains at least the specified number of elements.

- **`min`**: The minimum number of elements allowed in the array.
- **`message`** (optional): The error message to display when validation fails. If omitted, a default message will be used.

## Usage Example

Here is a complete example of how to use validation decorators within an Express application.

```typescript
import express, { Request, Response, NextFunction } from 'express'
import { bindingCargo, getCargo, Body, Min, Max, Suffix, CargoValidationError } from 'express-cargo'

// 1. Define a class with source and validation rules
class CreateAssetRequest {
    @Body('name')
    assetName!: string

    @Body('type')
    @Suffix('.png')
    assetType!: string

    @Body('quantity')
    @Min(1)
    @Max(100)
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
    "type": "icon.jpg", // Fails @Suffix('.png')
    "quantity": 101     // Fails @Max(100)
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
