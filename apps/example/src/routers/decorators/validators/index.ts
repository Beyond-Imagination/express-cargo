import type { Router } from 'express'
import numberRouter from './number'
import stringRouter from './string'
import comparisonRouter from './comparison'
import dateRouter from './date'
import arrayRouter from './array'
import crossFieldRouter from './crossField'

const validatorRouters: Router[] = [numberRouter, stringRouter, comparisonRouter, dateRouter, arrayRouter, crossFieldRouter]

export default validatorRouters
