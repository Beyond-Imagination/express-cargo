import express, { Router } from 'express'
import { bindingCargo, getCargo, Body, MinDate, MaxDate } from 'express-cargo'

const router: Router = express.Router()

class MinDateExample {
    @Body()
    @MinDate(new Date('2000-01-01'))
    date!: Date
}

router.post('/min-date', bindingCargo(MinDateExample), (req, res) => {
    const cargo = getCargo<MinDateExample>(req)
    res.json(cargo)
})

class MaxDateExample {
    @Body()
    @MaxDate(new Date('2099-12-31'))
    date!: Date
}

router.post('/max-date', bindingCargo(MaxDateExample), (req, res) => {
    const cargo = getCargo<MaxDateExample>(req)
    res.json(cargo)
})

export default router
