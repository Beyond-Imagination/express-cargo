import express, { Router } from 'express'
import { bindingCargo, getCargo, body, query, header, uri, equal, notEqual } from 'express-cargo'

const router: Router = express.Router()

class BodyExample {
    @body()
    number!: number

    @body()
    string!: string

    @body()
    boolean!: boolean
}

router.post('/body', bindingCargo(BodyExample), (req, res) => {
    const cargo = getCargo<BodyExample>(req)
    res.json(cargo)
})

class QueryExample {
    @query()
    number!: number

    @query()
    string!: string

    @query()
    boolean!: boolean
}

router.get('/query', bindingCargo(QueryExample), (req, res) => {
    const cargo = getCargo<QueryExample>(req)
    res.json(cargo)
})

class URIExample {
    @uri()
    id!: number
}

router.get('/uri/:id', bindingCargo(URIExample), (req, res) => {
    const cargo = getCargo<URIExample>(req)
    res.json(cargo)
})

class HeaderExample {
    @header()
    authorization!: string
}

router.get('/header', bindingCargo(HeaderExample), (req, res) => {
    const cargo = getCargo<HeaderExample>(req)
    res.json(cargo)
})

export default router
