import express, { Router } from 'express'
import expressSession from 'express-session'
import { bindingCargo, getCargo, body, query, header, uri, session } from 'express-cargo'

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

class CookieExample {
    @session()
    path!: string

    @session()
    httpOnly!: boolean

    @session()
    secure!: boolean
}

class SessionExample {
    @session()
    cookie!: CookieExample

    @session()
    userId!: string
}

router.use(expressSession({ secret: 'test', resave: false, cookie: { secure: false } }))

router.post('/session', (req, res) => {
    ;(req as any).session.userId = 'test-user-id'
    res.sendStatus(204)
})

router.get('/session', bindingCargo(SessionExample), (req, res) => {
    const cargo = getCargo<SessionExample>(req)
    res.json(cargo)
})

export default router
