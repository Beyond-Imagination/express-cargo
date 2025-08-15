import express, { Router } from 'express'
import { bindingCargo, getCargo, query, transform } from 'express-cargo'

const router: Router = express.Router()

class TransformExample {
    @query()
    @transform((value: string) => value.toLowerCase())
    sortBy!: string

    @query()
    @transform((value: string) => value.split(',').map(tag => tag.trim()))
    tags!: string[]
}

router.get('/transform', bindingCargo(TransformExample), (req, res) => {
    const cargo = getCargo<TransformExample>(req)

    res.json({
        message: 'Search parameters transformed successfully!',
        data: cargo,
        sortByType: typeof cargo?.sortBy,
        tagsType: typeof cargo?.tags,
        firstTag: cargo?.tags?.[0],
    })
})

export default router
