import type { Router } from 'express'
import decoratorRouters from './decorators'
import advancedRouters from './advanced'
import errorHandlerRouter from './errorHandler'

const routers: Router[] = [...decoratorRouters, ...advancedRouters, errorHandlerRouter]

export default routers
