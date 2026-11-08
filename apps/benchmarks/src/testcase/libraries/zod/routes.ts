import { RequestHandler, Router } from 'express'
import { nested25Scenario, validationFailureScenario, validScenario } from '../../scenarios'
import type { ValidResponse } from '../../scenarios/valid'
import type { OrderRequest } from '../../common/types'
import { requestSchema } from './types'

const parseZod: RequestHandler = (req, res, next) => {
    const result = requestSchema.safeParse({
        ...req.body,
        id: req.params.id,
        active: req.query.active,
        requestId: req.headers['request-id'],
    })
    if (!result.success) {
        res.status(400).json(validationFailureScenario.response)
        return
    }

    const input: OrderRequest = result.data
    res.locals.input = input
    next()
}

const respond: RequestHandler = (_req, res) => {
    const input: OrderRequest = res.locals.input
    const total = input.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    if (!Number.isFinite(total)) {
        res.status(400).json(validationFailureScenario.response)
        return
    }

    const response: ValidResponse = {
        id: input.id,
        active: input.active,
        requestId: input.requestId,
        name: input.name,
        email: input.email,
        age: input.age,
        role: input.role,
        itemCount: input.items.length,
        total,
    }
    res.json(response)
}

export const zodRouter: Router = Router()
zodRouter.post(validScenario.route, parseZod, respond)
zodRouter.post(validationFailureScenario.route, parseZod, respond)
zodRouter.post(nested25Scenario.route, parseZod, respond)
