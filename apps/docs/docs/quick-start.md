```typescript
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
