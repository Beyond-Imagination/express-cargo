import express, { Router } from 'express'
import { bindingCargo, Body, Default, Each, getCargo, Length, MaxLength, MinLength } from 'express-cargo'

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

class EachExample {
    @Body()
    @Each(MinLength(5), MaxLength(20))
    tags!: string[]

    @Body()
    @Each((val: number) => val % 2 === 0)
    evenNumbers!: number[]
}

router.post('/each', bindingCargo(EachExample), (req, res) => {
    const cargo = getCargo<EachExample>(req)
    res.json(cargo)
})

export default router
