import express from 'express'
import sourceRouter from './routers/source'

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(sourceRouter)

app.listen(port, () => {console.log(`Example app listening on port ${port}`)})
