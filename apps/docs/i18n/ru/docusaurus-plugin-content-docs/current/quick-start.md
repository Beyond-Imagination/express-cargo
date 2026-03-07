```typescript
import express from 'express'
import { Body, bindingCargo, getCargo, Min, Header, Params } from 'express-cargo'

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
    // напишите ваш код с привязанными данными
})

app.listen(3000)
```
