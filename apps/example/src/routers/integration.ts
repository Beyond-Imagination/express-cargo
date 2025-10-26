import express, { Request, Router } from 'express'
import {
    body,
    query,
    params,
    validate,
    header,
    prefix,
    transform,
    request,
    array,
    bindingCargo,
    getCargo,
} from 'express-cargo'

const router: Router = express.Router()

class PostData {
    @body()
    name!: string

    @body()
    content!: string
}

class BodyExample {
    @body()
    @array(PostData)
    posts!: PostData[]
}

class IntegrationExample extends BodyExample {
    @query()
    today!: Date

    @params()
    @validate(value => typeof value === 'number' && value > 0 && value <= 100)
    case!: number

    @header()
    @validate(value => value === 'application/json')
    'content-type'!: string

    @request((request: Request) => request.headers['authorization'])
    @prefix('Bearer ')
    @transform((value: string) => value.substring(7))
    token!: string
}

router.post('/integration/:case', bindingCargo(IntegrationExample), (req, res) => {
    const cargo = getCargo<IntegrationExample>(req)
    res.json(cargo)
})

export default router
