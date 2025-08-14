import express, { Router } from 'express'
import { bindingCargo, getCargo, query, transform } from 'express-cargo'

const router: Router = express.Router()

class TransformExample {
    @query()
    @transform((value: string) => parseInt(value, 10))
    page!: number

    @query()
    @transform((value: string) => value === 'true')
    isPublished!: boolean
}

router.post('/transform', bindingCargo(TransformExample), (req, res) => {
    const searchParams = getCargo<TransformExample>(req)

    res.json({
        message: 'Search parameters processed successfully!',
        data: searchParams,
        pageType: typeof searchParams?.page,
        isPublishedType: typeof searchParams?.isPublished,
    })
})

export default router
