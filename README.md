# express-cargo

**express-cargo** is a middleware library for Express.js that makes handling request data easier and more type-safe.
It provides class-based decorators and binding features to simplify complex request parsing and validation.

---

## Installation

```bash
npm install express-cargo reflect-metadata
```

---

## TypeScript Configuration
express-cargo uses TypeScript decorators and runtime type metadata.
To use it properly, you need to install TypeScript and enable a few compiler options.

### 1. Install TypeScript (if not already installed)
```
npm install -D typescript
```

### 2. Enable Decorator Support
Add the following settings to your tsconfig.json:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

---

## Quick Start

```ts
import express from 'express'
import { Body, bindingCargo, getCargo, min, Header, Params } from 'express-cargo'

const app = express()
app.use(express.json())

class RequestExample {
    @Body()
    name!: string

    @Body()
    @Min(0)
    age!: number

    @Params('id')
    id!: number

    @Header()
    authorization!: string
}

app.post('/:id', bindingCargo(RequestExample), (req, res) => {
    const data = getCargo<RequestExample>(req)
    // write your code with bound data
})

app.listen(3000)
```

---

## Documentation

Full guide and API reference:  
👉 [express-cargo Documentation](https://beyond-imagination.github.io/express-cargo/)

---

## Features

* **Class-based request parsing**: Automatically bind request data (body, query, params, etc.) using decorators
* **Type safety**: Fully compatible with TypeScript
* **Easy middleware integration**: Seamlessly works with existing Express middleware

---

### Binding Decorators

| Decorator    | Description                      | Example                     |
|--------------|----------------------------------|-----------------------------|
| `@Body()`    | Binds a field from `req.body`    | `@Body() name: string`      |
| `@Query()`   | Binds a field from `req.query`   | `@Query() page: number`     |
| `@Params()`  | Binds a field from `req.params`  | `@Params() id: string`      |
| `@Uri()`     | alias of @params()               | `@Uri() id: string`         |
| `@Header()`  | Binds a field from `req.headers` | `@Header() token: string`   |
| `@Session()` | Binds a field from `req.session` | `@Session() userId: string` |

### Validation Decorators

| Decorator                                                                     | Description                                                                                                                                                      | Example                                                                                                                  |
|-------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `@Optional()`                                                                 | Skip validation when value is null or undefined.                                                                                                                 | `@Optional() value?: number`                                                                                             |
| `@Min(minimum: number)`                                                       | Number must be greater than or equal to `minimum`.                                                                                                               | `@Min(18) age!: number`                                                                                                  |
| `@Max(maximum: number)`                                                       | Number must be less than or equal to `maximum`.                                                                                                                  | `@Max(100) score!: number`                                                                                               |
| `@Range(min: number, max: number)`                                            | Number must be between `min` and `max` (inclusive).                                                                                                              | `@Range(1, 5) rating!: number`                                                                                           |
| `@Contains(seed: string)`                                                     | String must contain `seed`.                                                                                                                                      | `@Contains('hello') greeting!: string`                                                                                   |
| `@Prefix(prefixText: string)`                                                 | String must start with `prefixText`.                                                                                                                             | `@Prefix('IMG_') fileName!: string`                                                                                      |
| `@Suffix(suffixText: string)`                                                 | String must end with `suffixText`.                                                                                                                               | `@Suffix('.jpg') fileName!: string`                                                                                      |
| `@Length(value: number)`                                                      | String length must be exactly `value`.                                                                                                                           | `@Length(6) otp!: string`                                                                                                |
| `@MinLength(min: number)`                                                     | String length must be greater than or equal to `min`.                                                                                                            | `@MinLength(8) password!: string`                                                                                        |
| `@MaxLength(max: number)`                                                     | String length must be less than or equal to `max`.                                                                                                               | `@MaxLength(20) username!: string`                                                                                       |
| `@Equal(value: any)`                                                          | Value must be strictly equal to `value`.                                                                                                                         | `@Equal('production') env!: string`                                                                                      |
| `@NotEqual(value: any)`                                                       | Value must not be equal to `value`.                                                                                                                              | `@NotEqual('admin') role!: string`                                                                                       |
| `@IsTrue()`                                                                   | Value must be `true`.                                                                                                                                            | `@IsTrue() acceptedTerms!: boolean`                                                                                      |
| `@IsFalse()`                                                                  | Value must be `false`.                                                                                                                                           | `@IsFalse() blocked!: boolean`                                                                                           |
| `@OneOf(options: readonly any[])`                                             | Value must be one of `options`.                                                                                                                                  | `@OneOf(['credit','debit'] as const) method!: 'credit' \| 'debit'`                                                       |
| `@ListContains(values: any[], comparator?: (expected, actual) => boolean)`    | The array must contain all specified values. When `comparator` is provided, all comparisons are delegated to it.                                                 | `@ListContains([1, 2]) nums!: number[]`<br>`@ListContains(['a'], (e, a) => a.toLowerCase() === e) strs!: string[]`       |
| `@ListNotContains(values: any[], comparator?: (expected, actual) => boolean)` | The array must NOT contain any of the specified values. When `comparator` is provided, all comparisons are delegated to it.                                      | `@ListNotContains([1, 2]) nums!: number[]`<br>`@ListNotContains(['a'], (e, a) => a.toLowerCase() === e) strs!: string[]` |
| `@ListMaxSize(max: number, message?)`                                         | The array must contain no more than `max` elements.                                                                                                              | `@ListMaxSize(5) tags!: string[]`                                                                                        |
| `@ListMinSize(min: number, message?)`                                         | The array must contain at least `min` elements.                                                                                                                  | `@ListMinSize(5) tags!: string[]`                                                                                        |
| `@Enum(enumObj: object, message?)`                                            | Value must be a member of `enumObj`.                                                                                                                             | `@Enum(UserRole) role!: UserRole`                                                                                        |
| `@Validate(validateFn, message?)`                                             | Custom validation function.                                                                                                                                      | `@Validate(v => typeof v === 'string' && v.includes('@'), 'invalid email') email!: string`                               |
| `@Regexp(pattern: RegExp, message?)`                                          | String must match the given regular expression.                                                                                                                  | `@Regexp(/^[0-9]+$/, 'digits only') phone!: string`                                                                      |
| `@Email()`                                                                    | String must be email format.                                                                                                                                     | `@Email() email!: string`                                                                                                |
| `@Uuid(version?, message?)`                                                   | Validates that the field is a valid UUID, optionally restricted to a specific version (v1, v3, v4, or v5).                                                       | `@Uuid('v4') requestId!: string`                                                                                         |
| `@Alpha(message?: string)`                                                    | Validates that the field contains alphabetic characters (A–Z, a–z) only.                                                                                         | `@Alpha() firstName!: string`                                                                                            |
| `@Alphanumeric(message?: string)`                                             | Validates that the field contains alphanumeric characters (A-Z, a-z, 0-9) only.                                                                                  | `@Alphanumeric() productCode!: string`                                                                                   |
| `@IsUppercase(message?: string)`                                              | Validates that the field contains only uppercase characters.                                                                                                     | `@IsUppercase() countryCode!: string`                                                                                    |
| `@IsLowercase(message?: string)`                                              | Validates that the field contains only lowercase characters.                                                                                                     | `@IsLowercase() username!: string`                                                                                       |
| `@IsJwt(message?: string)`                                                    | Validates that the field is a valid JSON Web Token (JWT) in `header.payload.signature` format using Base64URL characters.                                        | `@IsJwt() accessToken!: string`                                                                                          |
| `@IsUrl(options?: IsUrlOptions, message?: string)`                            | Validates that the field is a valid URL. `http`, `https`, and `ftp` protocols are allowed by default. Use `options.protocols` to customize allowed protocols.    | `@IsUrl() website!: string`                                                                                              |
| `@IsPhoneNumber(region?: CountryCode, message?: string)`                      | Validates that the field is a valid phone number using libphonenumber-js. Supports all countries. With a region, local formats are accepted.                     | `@IsPhoneNumber('KR') phone!: string`                                                                                    |
| `@IsTimeZone(message?: string)`                                               | Validates that the field is a valid IANA timezone identifier (e.g., `Asia/Seoul`, `UTC`). Uses the built-in `Intl` API.                                         | `@IsTimeZone() tz!: string`                                                                                              |
| `@IsHexColor(message?: string)`                                               | Validates that the field is a valid hex color code. Supports `#RGB`, `#RGBA`, `#RRGGBB`, and `#RRGGBBAA` formats (case-insensitive). The `#` prefix is required. | `@IsHexColor() color!: string`                                                                                           |
| `@IsHexadecimal(message?: string)`                                            | Validates that the field is a hexadecimal number (characters `0-9` and `a-f`, case-insensitive). The `0x` prefix is also allowed.                                | `@IsHexadecimal() color!: string`                                                                                        |
| `@IsHash(algorithm: HashAlgorithm, message?: string)`                         | Validates that the field is a valid hash string for the given algorithm. Supported: `md5`, `sha1`, `sha256`, `sha384`, `sha512`, `crc32`, `crc32b`.              | `@IsHash('sha256') checksum!: string`                                                                                    |
| `@MinDate(min: Date \| (() => Date), message?: string)`                       | Validates that the field is a `Date` on or after the given minimum date. Accepts a fixed date or a function for dynamic comparison.                              | `@MinDate(new Date('2000-01-01')) createdAt!: Date`                                                                      |
| `@MaxDate(max: Date \| (() => Date), message?: string)`                       | Validates that the field is a `Date` on or before the given maximum date. Accepts a fixed date or a function for dynamic comparison.                             | `@MaxDate(new Date('2099-12-31')) createdAt!: Date`                                                                      |
| `@With(fieldName: string)`                                                    | Validates that if the decorated field has a value, the specified target field (fieldName) must also have a value, establishing a mandatory dependency.           | `@With('price') discountRate?: number`                                                                                   |
| `@Without(fieldName: string)`                                                 | Validates that if the decorated field has a value, the specified target field (fieldName) must NOT have a value, establishing a mutually exclusive relationship. | `@Without('isGuest') password?: string`                                                                                  |

---

### Transform Decorators

| Decorator                 | Description                               | Example                                                                 |
|---------------------------|-------------------------------------------|-------------------------------------------------------------------------|
| `@Transform(transformer)` | Transform the parsed value                | `@Transform(v => v.trim()) name!: string`                               |
| `@Request(transformer)`   | Extract value from Express Request object | `@Request(req => req.ip) clientIp!: string`                             |
| `@Virtual(transformer)`   | Compute value from other fields           | `@Virtual(obj => obj.firstName + ' ' + obj.lastName) fullName!: string` |

### Utility Decorators

| Decorator                          | Description                                                                                                           | Example                             |
|------------------------------------|-----------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| `@Type(typeFn, options?)`          | Specifies the class used to transform raw data. Supports dynamic class resolution and resolves circular dependencies. | `@Type(() => User) user!: User`     |
| `@Default(value)`                  | Set default value when field is missing                                                                               | `@Default(0) count!: number`        |
| `@List(elementType)`               | Specify array element type                                                                                            | `@List(String) tags!: string[]`     |
| `@Each((validator \| function)[])` | Applies validation rules to every individual element within an array.                                                 | `@Each(Length(10)) tags!: string[]` |

### Error Handling

When validation fails, `bindingCargo` throws a `CargoValidationError` containing a list of `CargoFieldError` objects. You can handle it using `setCargoErrorHandler` (recommended) or Express's built-in error middleware.

**Option 1: `setCargoErrorHandler` (Recommended)**

Register a global handler once at app startup:

```ts
import { setCargoErrorHandler, CargoValidationError } from 'express-cargo'

setCargoErrorHandler((err, req, res, next) => {
    res.status(400).json({
        error: 'Validation failed',
        details: err.errors.map(e => ({
            field: e.field,
            message: e.message,
        })),
    })
})
```

**Option 2: Express Error Middleware**

```ts
import { CargoValidationError } from 'express-cargo'
import { Request, Response, NextFunction } from 'express'

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.errors.map(e => ({
                field: e.field,
                message: e.message,
            })),
        })
    }
    next(err)
})
```

> If `setCargoErrorHandler` is registered, it takes priority over the Express error middleware. The Express error middleware will only receive the error if `next(err)` is called inside `setCargoErrorHandler`.

## License

MIT
