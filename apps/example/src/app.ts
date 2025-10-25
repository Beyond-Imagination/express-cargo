import express from 'express'
import sourceRouter from './routers/source'
import validatorRouter from './routers/validator'
import transformRouter from './routers/transform'
import classFieldInheritanceRouter from './routers/classFieldInheritance'
import decoratorRouter from './routers/decorator'
import arrayFieldRouter from './routers/typeCasting'
import errorHandlerRouter from './routers/errorHandler'
import './errors/cargoErrorHandler'

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(sourceRouter)
app.use(validatorRouter)
app.use(transformRouter)
app.use(classFieldInheritanceRouter)
app.use(decoratorRouter)
app.use(arrayFieldRouter)
app.use(errorHandlerRouter)

app.listen(port, () => {console.log(`Example app listening on port ${port}`)})
