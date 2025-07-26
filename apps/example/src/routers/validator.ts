import express, { Router } from 'express'
import { bindingCargo, getCargo, body, equal, notEqual } from 'express-cargo'

const router: Router = express.Router()

class EqualExample {
    @body()
    @equal(3)
    number!: number

    @body()
    @equal('text')
    string!: string

    @body()
    @equal(true)
    boolean!: boolean

    @body()
    @equal(null)
    nullValue!: null

    @body()
    @equal(undefined)
    undefinedValue!: undefined
}

router.post('/equal', bindingCargo(EqualExample), (req, res) => {
    const cargo = getCargo<EqualExample>(req)
    res.json(cargo)
})

class NotEqualExample {
    @body()
    @notEqual(3)
    number!: number

    @body()
    @notEqual('text')
    string!: string

    @body()
    @notEqual(true)
    boolean!: boolean

    @body()
    @notEqual(null)
    nullValue!: null

    @body()
    @notEqual(undefined)
    undefinedValue!: undefined
}

router.post('/not-equal', bindingCargo(NotEqualExample), (req, res) => {
    const cargo = getCargo<NotEqualExample>(req)
    res.json(cargo)
})

export default router
