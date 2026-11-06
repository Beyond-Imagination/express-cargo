import { RequestHandler, Router } from 'express'
import { bindingCargo, getCargo, setCargoErrorHandler } from 'express-cargo'
import { nested25Scenario, validationFailureScenario, validScenario } from '../../scenarios'
import type { ValidResponse } from '../../scenarios/valid'
import { CargoRequest } from './types'

setCargoErrorHandler((_error, _req, res) => {
    res.status(400).json(validationFailureScenario.response)
})

const bindRequest = bindingCargo(CargoRequest)

const respond: RequestHandler = (req, res) => {
    const input = getCargo<CargoRequest>(req)
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

export const expressCargoRouter: Router = Router()
expressCargoRouter.post(validScenario.route, bindRequest, respond)
expressCargoRouter.post(validationFailureScenario.route, bindRequest, respond)
expressCargoRouter.post(nested25Scenario.route, bindRequest, respond)
