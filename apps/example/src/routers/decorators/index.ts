import type { Router } from 'express'
import sourceRouter from './source'
import fileRouter from './file'
import transformRouter from './transform'
import typeHelperRouter from './typeHelper'
import missingHandlerRouter from './missingHandler'
import validatorRouters from './validators'

const decoratorRouters: Router[] = [sourceRouter, fileRouter, transformRouter, typeHelperRouter, missingHandlerRouter, ...validatorRouters]

export default decoratorRouters
