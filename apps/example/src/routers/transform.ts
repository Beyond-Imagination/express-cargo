import express, { Router } from 'express'
import { bindingCargo, getCargo, query, transform } from 'express-cargo'

const router: Router = express.Router()

class TransformExample {
    @query()
    @transform((value: string) => value.toLowerCase())
    sortBy!: string

    @query()
    @transform((value: number) => value * 2)
    count!: number
}

router.get('/transform', bindingCargo(TransformExample), (req, res) => {
    const cargo = getCargo<TransformExample>(req)

    res.json({
        message: 'Search parameters transformed successfully!',
        data: cargo,
        sortByType: typeof cargo?.sortBy,
        countType: typeof cargo?.count,
        doubleCount: cargo?.count,
    })
})

export default router
