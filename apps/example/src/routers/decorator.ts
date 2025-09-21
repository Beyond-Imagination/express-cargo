import express, { Router } from 'express'
import { bindingCargo, body, defaultValue, getCargo } from 'express-cargo'

const router: Router = express.Router()

class DefaultExample {
    @body()
    @defaultValue(3)
    number!: number

    @body()
    @defaultValue('2')
    string!: string

    @body()
    @defaultValue(false)
    boolean!: boolean
}

router.post('/default', bindingCargo(DefaultExample), (req, res) => {
    const cargo = getCargo<DefaultExample>(req)
    res.json(cargo)
})

export default router
