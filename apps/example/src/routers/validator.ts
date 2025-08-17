import express, { Router } from 'express'
import { bindingCargo, getCargo, body, equal, notEqual, prefix, suffix, validate, regexp } from 'express-cargo'

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

class PrefixExample {
    @body()
    @prefix('https://')
    url!: string
}

router.post('/prefix', bindingCargo(PrefixExample), (req, res) => {
    const cargo = getCargo<PrefixExample>(req)
    res.json(cargo)
})

class SuffixExample {
    @body()
    @suffix('.png')
    photo!: string
}

router.post('/suffix', bindingCargo(SuffixExample), (req, res) => {
    const cargo = getCargo<SuffixExample>(req)
    res.json(cargo)
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

class RegexpExample {
    @body()
    @regexp(/^01[016789]-\d{3,4}-\d{4}$/)
    phone!: string
}

router.post('/regexp', bindingCargo(RegexpExample), (req, res) => {
    const cargo = getCargo<RegexpExample>(req)
    res.json(cargo)
})

export default router
