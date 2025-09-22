# express-cargo

**express-cargo** is a middleware library for Express.js that makes handling request data easier and more type-safe.
It provides class-based decorators and binding features to simplify complex request parsing and validation.

---

## Installation

```bash
npm install express-cargo reflect-metadata
```

---

## Quick Start

```ts
import express from 'express'
import { body, bindingCargo, getCargo, min, header, params } from 'express-cargo'

const app = express()
app.use(express.json())

class RequestExample {
    @body()
    name!: string

    @body()
    @min(0)
    age!: number

    @params('id')
    id!: number

    @header()
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
| `@body()`    | Binds a field from `req.body`    | `@body() name: string`      |
| `@query()`   | Binds a field from `req.query`   | `@query() page: number`     |
| `@params()`  | Binds a field from `req.params`  | `@params() id: string`      |
| `@uri()`     | alias of @params()               | `@uri() id: string`         |
| `@header()`  | Binds a field from `req.headers` | `@header() token: string`   |
| `@session()` | Binds a field from `req.session` | `@session() userId: string` |

### Validation Decorators
| Decorator                               | Description                                           | Example |
|-----------------------------------------|-------------------------------------------------------|---------|
| `@min(minimum: number)`                 | Number must be greater than or equal to `minimum`.    | `@min(18) age!: number` |
| `@max(maximum: number)`                 | Number must be less than or equal to `maximum`.       | `@max(100) score!: number` |
| `@range(min: number, max: number)`      | Number must be between `min` and `max` (inclusive).   | `@range(1, 5) rating!: number` |
| `@prefix(prefixText: string)`           | String must start with `prefixText`.                  | `@prefix('IMG_') fileName!: string` |
| `@suffix(suffixText: string)`           | String must end with `suffixText`.                    | `@suffix('.jpg') fileName!: string` |
| `@length(value: number)`                | String length must be exactly `value`.                | `@length(6) otp!: string` |
| `@minLength(min: number)`               | String length must be greater than or equal to `min`. | `@minLength(8) password!: string` |
| `@maxLength(max: number)`               | String length must be less than or equal to `max`.    | `@maxLength(20) username!: string` |
| `@equal(value: any)`                    | Value must be strictly equal to `value`.              | `@equal('production') env!: string` |
| `@notEqual(value: any)`                 | Value must not be equal to `value`.                   | `@notEqual('admin') role!: string` |
| `@isTrue()`                             | Value must be `true`.                                 | `@isTrue() acceptedTerms!: boolean` |
| `@isFalse()`                            | Value must be `false`.                                | `@isFalse() blocked!: boolean` |
| `@oneOf(options: readonly any[])`       | Value must be one of `options`.                       | `@oneOf(['credit','debit'] as const) method!: 'credit' \| 'debit'` |
| `@validate(validateFn, message?)`       | Custom validation function.                           | `@validate(v => typeof v === 'string' && v.includes('@'), 'invalid email') email!: string` |
| `@regexp(pattern: RegExp, message?)`    | String must match the given regular expression.       | `@regexp(/^[0-9]+$/, 'digits only') phone!: string` |

---

## License

MIT
