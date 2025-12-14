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

| Decorator                            | Description                                           | Example                                                                                    |
|--------------------------------------|-------------------------------------------------------|--------------------------------------------------------------------------------------------|
| `@Optional()`                        | Skip validation when value is null or undefined.      | `@Optional() value?: number`                                                               |
| `@Min(minimum: number)`              | Number must be greater than or equal to `minimum`.    | `@Min(18) age!: number`                                                                    |
| `@Max(maximum: number)`              | Number must be less than or equal to `maximum`.       | `@Max(100) score!: number`                                                                 |
| `@Range(min: number, max: number)`   | Number must be between `min` and `max` (inclusive).   | `@Range(1, 5) rating!: number`                                                             |
| `@Prefix(prefixText: string)`        | String must start with `prefixText`.                  | `@Prefix('IMG_') fileName!: string`                                                        |
| `@Suffix(suffixText: string)`        | String must end with `suffixText`.                    | `@Suffix('.jpg') fileName!: string`                                                        |
| `@Length(value: number)`             | String length must be exactly `value`.                | `@Length(6) otp!: string`                                                                  |
| `@MinLength(min: number)`            | String length must be greater than or equal to `min`. | `@MinLength(8) password!: string`                                                          |
| `@MaxLength(max: number)`            | String length must be less than or equal to `max`.    | `@MaxLength(20) username!: string`                                                         |
| `@Equal(value: any)`                 | Value must be strictly equal to `value`.              | `@Equal('production') env!: string`                                                        |
| `@NotEqual(value: any)`              | Value must not be equal to `value`.                   | `@NotEqual('admin') role!: string`                                                         |
| `@IsTrue()`                          | Value must be `true`.                                 | `@IsTrue() acceptedTerms!: boolean`                                                        |
| `@IsFalse()`                         | Value must be `false`.                                | `@IsFalse() blocked!: boolean`                                                             |
| `@OneOf(options: readonly any[])`    | Value must be one of `options`.                       | `@OneOf(['credit','debit'] as const) method!: 'credit' \| 'debit'`                         |
| `@Validate(validateFn, message?)`    | Custom validation function.                           | `@Validate(v => typeof v === 'string' && v.includes('@'), 'invalid email') email!: string` |
| `@Regexp(pattern: RegExp, message?)` | String must match the given regular expression.       | `@Regexp(/^[0-9]+$/, 'digits only') phone!: string`                                        |
| `@Email()`                           | String must be email format.                          | `@Email() email!: string`                                                                  |
| `@With(fieldName: string)`           | Validates that if the decorated field has a value, the specified target field (fieldName) must also have a value, establishing a mandatory dependency. | `@With('price') discountRate?: number`                                                     |

---

### Transform Decorators

| Decorator                 | Description                               | Example                                                                 |
|---------------------------|-------------------------------------------|-------------------------------------------------------------------------|
| `@Transform(transformer)` | Transform the parsed value                | `@Transform(v => v.trim()) name!: string`                               |
| `@Request(transformer)`   | Extract value from Express Request object | `@Request(req => req.ip) clientIp!: string`                             |
| `@Virtual(transformer)`   | Compute value from other fields           | `@Virtual(obj => obj.firstName + ' ' + obj.lastName) fullName!: string` |

### Utility Decorators

| Decorator             | Description                             | Example                          |
|-----------------------|-----------------------------------------|----------------------------------|
| `@Default(value)`     | Set default value when field is missing | `@Default(0) count!: number`     |
| `@Array(elementType)` | Specify array element type              | `@Array(String) tags!: string[]` |

### Error Handling

```ts
import { setCargoErrorHandler, CargoValidationError } from 'express-cargo'

// Custom error handler
setCargoErrorHandler((err, req, res, next) => {
    if (err instanceof CargoValidationError) {
        res.status(400).json({
        error: 'Validation failed',
        details: err.errors.map(e => ({
                field: e.field,
                message: e.name
            }))
        })
    } else {
        next(err)
    }
})
```

## License

MIT
