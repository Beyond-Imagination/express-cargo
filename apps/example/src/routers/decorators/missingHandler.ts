import express, { Router } from 'express'
import { bindingCargo, getCargo, Body, Default, Equal, Optional } from 'express-cargo'

const router: Router = express.Router()

class OptionalExample {
    @Body()
    @Optional()
    @Equal(1)
    number?: number
}

router.post('/optional', bindingCargo(OptionalExample), (req, res) => {
    const cargo = getCargo<OptionalExample>(req)
    res.json(cargo)
})

class DefaultExample {
    @Body()
    @Default(3)
    number!: number

    @Body()
    @Default('2')
    string!: string

    @Body()
    @Default(false)
    boolean!: boolean
}

router.post('/default', bindingCargo(DefaultExample), (req, res) => {
    const cargo = getCargo<DefaultExample>(req)
    res.json(cargo)
})

export default router
