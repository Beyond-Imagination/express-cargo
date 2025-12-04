import express, { Router } from 'express'
import expressSession from 'express-session'
import { bindingCargo, getCargo, Body, Query, Header, Uri, Session } from 'express-cargo'

const router: Router = express.Router()

class BodyExample {
    @Body()
    number!: number

    @Body()
    string!: string

    @Body()
    boolean!: boolean
}

router.post('/body', bindingCargo(BodyExample), (req, res) => {
    const cargo = getCargo<BodyExample>(req)
    res.json(cargo)
})

class QueryExample {
    @Query()
    number!: number

    @Query()
    string!: string

    @Query()
    boolean!: boolean
}

router.get('/query', bindingCargo(QueryExample), (req, res) => {
    const cargo = getCargo<QueryExample>(req)
    res.json(cargo)
})

class URIExample {
    @Uri()
    id!: number
}

router.get('/uri/:id', bindingCargo(URIExample), (req, res) => {
    const cargo = getCargo<URIExample>(req)
    res.json(cargo)
})

class HeaderExample {
    @Header()
    authorization!: string
}

router.get('/header', bindingCargo(HeaderExample), (req, res) => {
    const cargo = getCargo<HeaderExample>(req)
    res.json(cargo)
})

class CookieExample {
    @Session()
    path!: string

    @Session()
    httpOnly!: boolean

    @Session()
    secure!: boolean
}

class SessionExample {
    @Session()
    cookie!: CookieExample

    @Session()
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
