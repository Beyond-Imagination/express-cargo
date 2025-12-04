import express, { Router } from 'express'
import {
    bindingCargo,
    getCargo,
    Body,
    equal,
    notEqual,
    prefix,
    suffix,
    isTrue,
    isFalse,
    oneOf,
    maxLength,
    minLength,
    length,
    validate,
    regexp,
    email,
    Optional,
    min,
    max,
    range,
    isAlpha,
    uuid,
    alphanumeric,
} from 'express-cargo'

const router: Router = express.Router()

class OptionalExample {
    @Body()
    @Optional()
    @equal(1)
    number?: number
}

router.post('/optional', bindingCargo(OptionalExample), (req, res) => {
    const cargo = getCargo<OptionalExample>(req)
    res.json(cargo)
})

class MinExample {
    @Body()
    @min(1)
    number!: number
}

router.post('/min', bindingCargo(MinExample), (req, res) => {
    const cargo = getCargo<MinExample>(req)
    res.json(cargo)
})

class MaxExample {
    @Body()
    @max(10)
    number!: number
}

router.post('/max', bindingCargo(MaxExample), (req, res) => {
    const cargo = getCargo<MaxExample>(req)
    res.json(cargo)
})

class RangeExample {
    @Body()
    @range(10, 20)
    number!: number
}

router.post('/range', bindingCargo(RangeExample), (req, res) => {
    const cargo = getCargo<RangeExample>(req)
    res.json(cargo)
})

class EqualExample {
    @Body()
    @equal(3)
    number!: number

    @Body()
    @equal('text')
    string!: string

    @Body()
    @equal(true)
    boolean!: boolean
}

router.post('/equal', bindingCargo(EqualExample), (req, res) => {
    const cargo = getCargo<EqualExample>(req)
    res.json(cargo)
})

class NotEqualExample {
    @Body()
    @notEqual(3)
    number!: number

    @Body()
    @notEqual('text')
    string!: string

    @Body()
    @notEqual(true)
    boolean!: boolean
}

router.post('/not-equal', bindingCargo(NotEqualExample), (req, res) => {
    const cargo = getCargo<NotEqualExample>(req)
    res.json(cargo)
})

class PrefixExample {
    @Body()
    @prefix('https://')
    url!: string
}

router.post('/prefix', bindingCargo(PrefixExample), (req, res) => {
    const cargo = getCargo<PrefixExample>(req)
    res.json(cargo)
})

class SuffixExample {
    @Body()
    @suffix('.png')
    photo!: string
}

router.post('/suffix', bindingCargo(SuffixExample), (req, res) => {
    const cargo = getCargo<SuffixExample>(req)
    res.json(cargo)
})

class IsTrueExample {
    @Body()
    @isTrue()
    booleanValue!: boolean
}

router.post('/is-true', bindingCargo(IsTrueExample), (req, res) => {
    const cargo = getCargo<IsTrueExample>(req)
    res.json(cargo)
})

class IsFalseExample {
    @Body()
    @isFalse()
    booleanValue!: boolean
}

router.post('/is-false', bindingCargo(IsFalseExample), (req, res) => {
    const cargo = getCargo<IsFalseExample>(req)
    res.json(cargo)
})

class OneOfExample {
    @Body()
    @oneOf(['js', 'ts', 'html', 'css'])
    language!: string
}

router.post('/one-of', bindingCargo(OneOfExample), (req, res) => {
    const cargo = getCargo<OneOfExample>(req)
    res.json(cargo)
})

class MaxLengthExample {
    @Body()
    @maxLength(5)
    name!: string
}

router.post('/max-length', bindingCargo(MaxLengthExample), (req, res) => {
    const cargo = getCargo<MaxLengthExample>(req)
    res.json(cargo)
})

class MinLengthExample {
    @Body()
    @minLength(2)
    name!: string
}

router.post('/min-length', bindingCargo(MinLengthExample), (req, res) => {
    const cargo = getCargo<MinLengthExample>(req)
    res.json(cargo)
})

class LengthExample {
    @Body()
    @length(2)
    name!: string
}

router.post('/length', bindingCargo(LengthExample), (req, res) => {
    const cargo = getCargo<LengthExample>(req)
    res.json(cargo)
})

class ValidateExample {
    @Body()
    @validate(email => (email as string).split('@').length === 2)
    email!: string
}

router.post('/validate', bindingCargo(ValidateExample), (req, res) => {
    const cargo = getCargo<ValidateExample>(req)
    res.json(cargo)
})

class RegexpExample {
    @Body()
    @regexp(/^01[016789]-\d{3,4}-\d{4}$/)
    phone!: string
}

router.post('/regexp', bindingCargo(RegexpExample), (req, res) => {
    const cargo = getCargo<RegexpExample>(req)
    res.json(cargo)
})

class EmailExample {
    @Body()
    @email()
    email!: string
}

router.post('/email', bindingCargo(EmailExample), (req, res) => {
    const cargo = getCargo<EmailExample>(req)
    res.json(cargo)
})

class AlphaExample {
    @Body()
    @isAlpha()
    name!: string
}

router.post('/alpha', bindingCargo(AlphaExample), (req, res) => {
    const cargo = getCargo<AlphaExample>(req)
    res.json(cargo)
})

class UuidExample {
    @Body()
    @uuid()
    uuidAll!: string

    @Body()
    @uuid('v4')
    uuid!: string
}

router.post('/uuid', bindingCargo(UuidExample), (req, res) => {
    const cargo = getCargo<UuidExample>(req)
    res.json(cargo)
})

class AlphanumericExample {
    @Body()
    @alphanumeric()
    alphanumeric!: string
}

router.post('/alphanumeric', bindingCargo(AlphanumericExample), (req, res) => {
    const cargo = getCargo<AlphanumericExample>(req)
    res.json(cargo)
})

export default router
