import express, { NextFunction, Request, Response } from 'express'
import cargo = require('express-cargo')
const { bindingCargo, getCargo, body, query, header, params, Min, Max, Equal, NotEqual, Prefix, Suffix } = cargo

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

class ExampleRequest {
    @body()
    @Min(1)
    @Max(10)
    @NotEqual(5)
    number!: number

    @query()
    @Suffix('@gmail.com')
    email!: string

    @header('Authorization')
    @Prefix('Bearer ')
    token!: string

    @params()
    @Equal('1')
    id!: string
}

app.post('/example/:id', bindingCargo(ExampleRequest), (req, res) => {
    const cargo = getCargo<ExampleRequest>(req)
    res.json(cargo)
})

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof cargo.CargoValidationError) {
        return res.status(400).json({
            errors: err.errors,
            message: err.message,
        })
    }
    return res.status(500).json({
        message: 'Internal Server Error',
    })
})

app.listen(port, () => {console.log(`Example app listening on port ${port}`)})
