import express from 'express'
import routers from './routers'
import './errors/cargoErrorHandler'

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(routers)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
