import express, { Router } from 'express'
import {
    bindingCargo,
    getCargo,
    Body,
    Contains,
    Prefix,
    Suffix,
    MaxLength,
    MinLength,
    Length,
    Regexp,
    Email,
    Alpha,
    Uuid,
    Alphanumeric,
    IsUppercase,
    IsLowercase,
    IsJwt,
    IsUrl,
    IsPhoneNumber,
    IsTimeZone,
    IsHexColor,
    IsHexadecimal,
    IsHash,
} from 'express-cargo'

const router: Router = express.Router()

class ContainsExample {
    @Body()
    @Contains('hello')
    greeting!: string
}

router.post('/contains', bindingCargo(ContainsExample), (req, res) => {
    const cargo = getCargo<ContainsExample>(req)
    res.json(cargo)
})

class PrefixExample {
    @Body()
    @Prefix('https://')
    url!: string
}

router.post('/prefix', bindingCargo(PrefixExample), (req, res) => {
    const cargo = getCargo<PrefixExample>(req)
    res.json(cargo)
})

class SuffixExample {
    @Body()
    @Suffix('.png')
    photo!: string
}

router.post('/suffix', bindingCargo(SuffixExample), (req, res) => {
    const cargo = getCargo<SuffixExample>(req)
    res.json(cargo)
})

class MaxLengthExample {
    @Body()
    @MaxLength(5)
    name!: string
}

router.post('/max-length', bindingCargo(MaxLengthExample), (req, res) => {
    const cargo = getCargo<MaxLengthExample>(req)
    res.json(cargo)
})

class MinLengthExample {
    @Body()
    @MinLength(2)
    name!: string
}

router.post('/min-length', bindingCargo(MinLengthExample), (req, res) => {
    const cargo = getCargo<MinLengthExample>(req)
    res.json(cargo)
})

class LengthExample {
    @Body()
    @Length(2)
    name!: string
}

router.post('/length', bindingCargo(LengthExample), (req, res) => {
    const cargo = getCargo<LengthExample>(req)
    res.json(cargo)
})

class RegexpExample {
    @Body()
    @Regexp(/^01[016789]-\d{3,4}-\d{4}$/)
    phone!: string
}

router.post('/regexp', bindingCargo(RegexpExample), (req, res) => {
    const cargo = getCargo<RegexpExample>(req)
    res.json(cargo)
})

class EmailExample {
    @Body()
    @Email()
    email!: string
}

router.post('/email', bindingCargo(EmailExample), (req, res) => {
    const cargo = getCargo<EmailExample>(req)
    res.json(cargo)
})

class AlphaExample {
    @Body()
    @Alpha()
    name!: string
}

router.post('/alpha', bindingCargo(AlphaExample), (req, res) => {
    const cargo = getCargo<AlphaExample>(req)
    res.json(cargo)
})

class UuidExample {
    @Body()
    @Uuid()
    uuidAll!: string

    @Body()
    @Uuid('v4')
    uuid!: string
}

router.post('/uuid', bindingCargo(UuidExample), (req, res) => {
    const cargo = getCargo<UuidExample>(req)
    res.json(cargo)
})

class AlphanumericExample {
    @Body()
    @Alphanumeric()
    alphanumeric!: string
}

router.post('/alphanumeric', bindingCargo(AlphanumericExample), (req, res) => {
    const cargo = getCargo<AlphanumericExample>(req)
    res.json(cargo)
})

class IsUppercaseExample {
    @Body()
    @IsUppercase()
    text!: string
}

router.post('/is-uppercase', bindingCargo(IsUppercaseExample), (req, res) => {
    const cargo = getCargo<IsUppercaseExample>(req)
    res.json(cargo)
})

class IsLowercaseExample {
    @Body()
    @IsLowercase()
    text!: string
}

router.post('/is-lowercase', bindingCargo(IsLowercaseExample), (req, res) => {
    const cargo = getCargo<IsLowercaseExample>(req)
    res.json(cargo)
})

class IsJwtExample {
    @Body()
    @IsJwt()
    token!: string
}

router.post('/is-jwt', bindingCargo(IsJwtExample), (req, res) => {
    const cargo = getCargo<IsJwtExample>(req)
    res.json(cargo)
})

class IsUrlExample {
    @Body()
    @IsUrl()
    url!: string
}

router.post('/is-url', bindingCargo(IsUrlExample), (req, res) => {
    const cargo = getCargo<IsUrlExample>(req)
    res.json(cargo)
})

class IsPhoneNumberExample {
    @Body()
    @IsPhoneNumber('KR')
    phone!: string
}

router.post('/is-phone-number', bindingCargo(IsPhoneNumberExample), (req, res) => {
    const cargo = getCargo<IsPhoneNumberExample>(req)
    res.json(cargo)
})

class IsTimeZoneExample {
    @Body()
    @IsTimeZone()
    timezone!: string
}

router.post('/is-timezone', bindingCargo(IsTimeZoneExample), (req, res) => {
    const cargo = getCargo<IsTimeZoneExample>(req)
    res.json(cargo)
})

class IsHexColorExample {
    @Body()
    @IsHexColor()
    color!: string
}

router.post('/is-hex-color', bindingCargo(IsHexColorExample), (req, res) => {
    const cargo = getCargo<IsHexColorExample>(req)
    res.json(cargo)
})

class IsHexadecimalExample {
    @Body()
    @IsHexadecimal()
    value!: string
}

router.post('/is-hexadecimal', bindingCargo(IsHexadecimalExample), (req, res) => {
    const cargo = getCargo<IsHexadecimalExample>(req)
    res.json(cargo)
})

class IsHashExample {
    @Body()
    @IsHash('md5')
    md5!: string

    @Body()
    @IsHash('sha256')
    sha256!: string
}

router.post('/is-hash', bindingCargo(IsHashExample), (req, res) => {
    const cargo = getCargo<IsHashExample>(req)
    res.json(cargo)
})

export default router
