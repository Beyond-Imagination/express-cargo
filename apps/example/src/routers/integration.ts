import express, { Router } from 'express'
import { Body, Query, Params, validate, Header, prefix, Transform, Request, Array, bindingCargo, getCargo } from 'express-cargo'

const router: Router = express.Router()

class PostData {
    @Body()
    name!: string

    @Body()
    content!: string
}

class BodyExample {
    @Body()
    @Array(PostData)
    posts!: PostData[]
}

class IntegrationExample extends BodyExample {
    @Query()
    today!: Date

    @Params()
    @validate(value => typeof value === 'number' && value > 0 && value <= 100)
    case!: number

    @Header()
    @validate(value => value === 'application/json')
    'content-type'!: string

    @Request(request => request.headers['authorization'])
    @prefix('Bearer ')
    @Transform((value: string) => value.substring(7))
    token!: string
}

router.post('/integration/:case', bindingCargo(IntegrationExample), (req, res) => {
    const cargo = getCargo<IntegrationExample>(req)
    res.json(cargo)
})

export default router
