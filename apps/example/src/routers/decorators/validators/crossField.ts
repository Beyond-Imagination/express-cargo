import express, { Router } from 'express'
import { bindingCargo, getCargo, Body, With, Without } from 'express-cargo'

const router: Router = express.Router()

class WithExample {
    @Body()
    limit!: number

    @Body()
    @With('limit')
    page!: number
}

router.post('/with', bindingCargo(WithExample), (req, res) => {
    const cargo = getCargo<WithExample>(req)
    res.json(cargo)
})

class WithoutExample {
    @Body()
    isPickup!: boolean

    @Body()
    @Without('isPickup')
    deliveryAddress?: string
}

router.post('/without', bindingCargo(WithoutExample), (req, res) => {
    const cargo = getCargo<WithoutExample>(req)
    res.json(cargo)
})

export default router
