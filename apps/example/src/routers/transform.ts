import express, { Router } from 'express'
import { bindingCargo, body, getCargo, query, transform, validate } from 'express-cargo'

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

class ValidateExample {
    @body()
    @validate(email => (email as string).split('@').length === 2)
    email!: string
}

router.post('/validate', bindingCargo(ValidateExample), (req, res) => {
    const cargo = getCargo<ValidateExample>(req)
    res.json(cargo)
})

export default router
