import express, { Router } from 'express'
import { bindingCargo, Body, Default, getCargo } from 'express-cargo'

const router: Router = express.Router()

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
