import express, { Router } from 'express'
import { bindingCargo, getCargo, body, equal, notEqual, prefix, suffix, isTrue, isFalse, oneOf, maxLength, minLength } from 'express-cargo'

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

class IsTrueExample {
    @body()
    @isTrue()
    booleanValue!: boolean
}

router.post('/is-true', bindingCargo(IsTrueExample), (req, res) => {
    const cargo = getCargo<IsTrueExample>(req)
    res.json(cargo)
})

class IsFalseExample {
    @body()
    @isFalse()
    booleanValue!: boolean
}

router.post('/is-false', bindingCargo(IsFalseExample), (req, res) => {
    const cargo = getCargo<IsFalseExample>(req)
    res.json(cargo)
})

class OneOfExample {
    @body()
    @oneOf(['js', 'ts', 'html', 'css'])
    language!: string
}

router.post('/one-of', bindingCargo(OneOfExample), (req, res) => {
    const cargo = getCargo<OneOfExample>(req)
    res.json(cargo)
})

class MaxLengthExample {
    @body()
    @maxLength(5)
    name!: string
}

router.post('/max-length', bindingCargo(MaxLengthExample), (req, res) => {
    const cargo = getCargo<MaxLengthExample>(req)
    res.json(cargo)
})

class MinLengthExample {
    @body()
    @minLength(2)
    name!: string
}

router.post('/min-length', bindingCargo(MinLengthExample), (req, res) => {
    const cargo = getCargo<MinLengthExample>(req)
    res.json(cargo)
})

export default router
