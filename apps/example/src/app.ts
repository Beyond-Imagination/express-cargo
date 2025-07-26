import express from 'express'
import sourceRouter from './routers/source'
import validatorRouter from './routers/validator'

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(sourceRouter)
app.use(validatorRouter)

app.listen(port, () => {console.log(`Example app listening on port ${port}`)})
