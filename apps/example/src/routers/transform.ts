import express, { Router } from 'express'
import { bindingCargo, body, getCargo, transform } from 'express-cargo'

const router: Router = express.Router()

class TransformExample {
    @transform((value: string) => value.toLowerCase())
    @body('name')
    public name: string

    @transform((value: string) => parseInt(value, 10))
    @body('age')
    public age: number

    @transform((value: string) => value === 'true')
    @body('isActive')
    public isActive: boolean

    @transform((value: string) => value.split(',').map(item => item.trim()))
    @body('tags')
    public tags: string[]
}

router.post('/transform', bindingCargo(TransformExample), (req, res) => {
    const cargo = getCargo<TransformExample>(req)
    res.json(cargo)
})

export default router
