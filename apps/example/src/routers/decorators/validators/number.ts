import express, { Router } from 'express'
import { bindingCargo, getCargo, Body, Min, Max, Range } from 'express-cargo'

const router: Router = express.Router()

class MinExample {
    @Body()
    @Min(1)
    number!: number
}

router.post('/min', bindingCargo(MinExample), (req, res) => {
    const cargo = getCargo<MinExample>(req)
    res.json(cargo)
})

class MaxExample {
    @Body()
    @Max(10)
    number!: number
}

router.post('/max', bindingCargo(MaxExample), (req, res) => {
    const cargo = getCargo<MaxExample>(req)
    res.json(cargo)
})

class RangeExample {
    @Body()
    @Range(10, 20)
    number!: number
}

router.post('/range', bindingCargo(RangeExample), (req, res) => {
    const cargo = getCargo<RangeExample>(req)
    res.json(cargo)
})

export default router
