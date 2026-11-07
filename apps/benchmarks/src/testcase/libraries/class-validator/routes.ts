import { RequestHandler, Router } from 'express'
import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { nested25Scenario, validationFailureScenario, validScenario } from '../../scenarios'
import type { ValidResponse } from '../../scenarios/valid'
import type { OrderRequest } from '../../common/types'
import { ClassValidatorRequest } from './types'

const parseClassValidator: RequestHandler = (req, res, next) => {
    const input: OrderRequest = plainToInstance(ClassValidatorRequest, {
        ...req.body,
        id: req.params.id,
        active: req.query.active,
        requestId: req.headers['request-id'],
    })
    if (validateSync(input).length > 0) {
        res.status(400).json(validationFailureScenario.response)
        return
    }

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

export const classValidatorRouter: Router = Router()
classValidatorRouter.post(validScenario.route, parseClassValidator, respond)
classValidatorRouter.post(validationFailureScenario.route, parseClassValidator, respond)
classValidatorRouter.post(nested25Scenario.route, parseClassValidator, respond)
