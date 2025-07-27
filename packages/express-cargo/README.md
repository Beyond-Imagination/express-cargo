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
import { body, bindingCargo, getCargo } from 'express-cargo'

const app = express()
app.use(express.json())

class BodyExample {
  @body() number1!: number
  @body() number2!: number
}

app.post('/sum', bindingCargo(BodyExample), (req, res) => {
  const data = getCargo<BodyExample>(req)
  res.json({ sum: data.number1 + data.number2 })
})

app.listen(3000)
```

---

## Features

* **Class-based request parsing**: Automatically bind request data (body, query, params, etc.) using decorators
* **Type safety**: Fully compatible with TypeScript
* **Easy middleware integration**: Seamlessly works with existing Express middleware

---

## License

MIT
