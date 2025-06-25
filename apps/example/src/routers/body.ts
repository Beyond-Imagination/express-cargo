import express, { Router } from 'express'
import { body, bindingCargo, getCargo } from 'express-cargo'

const router: Router = express.Router()

class BodyExample {
    @body()
    number1: number

    @body()
    number2: number

    @body()
    number3: number
}

router.post('/', bindingCargo(BodyExample), (req, res) => {
    const cargo = getCargo<BodyExample>(req)
    res.json(cargo)
})

export default router
