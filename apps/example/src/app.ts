import express, { NextFunction, Request, Response } from 'express'
import sourceRouter from './routers/source'
import { CargoValidationError } from 'express-cargo'

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(sourceRouter)

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
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
