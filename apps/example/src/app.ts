import express from 'express'
import bodyRouter from './routers/body'

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(bodyRouter)

app.listen(port, () => {console.log(`Example app listening on port ${port}`)})
