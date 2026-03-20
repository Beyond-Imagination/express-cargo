import express, { Router } from 'express'
import {
    bindingCargo,
    getCargo,
    Body,
    Equal,
    NotEqual,
    Prefix,
    Suffix,
    IsTrue,
    IsFalse,
    OneOf,
    MaxLength,
    MinLength,
    Length,
    Validate,
    Regexp,
    Email,
    Optional,
    Min,
    Max,
    Range,
    Alpha,
    Uuid,
    Alphanumeric,
    IsUppercase,
    IsLowercase,
    IsJwt,
    IsUrl,
    With,
    Without,
    Enum,
    ArrayContains, ArrayMaxSize, Type, List,
} from 'express-cargo'

const router: Router = express.Router()

class OptionalExample {
    @Body()
    @Optional()
    @Equal(1)
    number?: number
}

router.post('/optional', bindingCargo(OptionalExample), (req, res) => {
    const cargo = getCargo<OptionalExample>(req)
    res.json(cargo)
})

class MinExample {
    @Body()
    @Min(1)
    number!: number
}

router.post('/min', bindingCargo(MinExample), (req, res) => {
    const cargo = getCargo<MinExample>(req)
    res.json(cargo)
})

class MaxExample {
    @Body()
    @Max(10)
    number!: number
}

router.post('/max', bindingCargo(MaxExample), (req, res) => {
    const cargo = getCargo<MaxExample>(req)
    res.json(cargo)
})

class RangeExample {
    @Body()
    @Range(10, 20)
    number!: number
}

router.post('/range', bindingCargo(RangeExample), (req, res) => {
    const cargo = getCargo<RangeExample>(req)
    res.json(cargo)
})

class EqualExample {
    @Body()
    @Equal(3)
    number!: number

    @Body()
    @Equal('text')
    string!: string

    @Body()
    @Equal(true)
    boolean!: boolean
}

router.post('/equal', bindingCargo(EqualExample), (req, res) => {
    const cargo = getCargo<EqualExample>(req)
    res.json(cargo)
})

class NotEqualExample {
    @Body()
    @NotEqual(3)
    number!: number

    @Body()
    @NotEqual('text')
    string!: string

    @Body()
    @NotEqual(true)
    boolean!: boolean
}

router.post('/not-equal', bindingCargo(NotEqualExample), (req, res) => {
    const cargo = getCargo<NotEqualExample>(req)
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

class IsTrueExample {
    @Body()
    @IsTrue()
    booleanValue!: boolean
}

router.post('/is-true', bindingCargo(IsTrueExample), (req, res) => {
    const cargo = getCargo<IsTrueExample>(req)
    res.json(cargo)
})

class IsFalseExample {
    @Body()
    @IsFalse()
    booleanValue!: boolean
}

router.post('/is-false', bindingCargo(IsFalseExample), (req, res) => {
    const cargo = getCargo<IsFalseExample>(req)
    res.json(cargo)
})

class OneOfExample {
    @Body()
    @OneOf(['js', 'ts', 'html', 'css'])
    language!: string
}

router.post('/one-of', bindingCargo(OneOfExample), (req, res) => {
    const cargo = getCargo<OneOfExample>(req)
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

class ValidateExample {
    @Body()
    @Validate(email => (email as string).split('@').length === 2)
    email!: string
}

router.post('/validate', bindingCargo(ValidateExample), (req, res) => {
    const cargo = getCargo<ValidateExample>(req)
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

class WithExample {
    @Body()
    limit!: number

    @Body()
    @With('limit')
    page!: number
}

router.post('/with', bindingCargo(WithExample), (req, res) => {
    const cargo = getCargo<WithExample>(req)
    res.json(cargo)
})

class WithoutExample {
    @Body()
    isPickup!: boolean

    @Body()
    @Without('isPickup')
    deliveryAddress?: string
}

router.post('/without', bindingCargo(WithoutExample), (req, res) => {
    const cargo = getCargo<WithoutExample>(req)
    res.json(cargo)
})

enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

class EnumExample {
    @Body()
    @Enum(UserRole)
    role!: UserRole
}

router.post('/enum', bindingCargo(EnumExample), (req, res) => {
    const cargo = getCargo<EnumExample>(req)
    res.json(cargo)
})

class ArrayContainsNested {
    @Body()
    name!: string
}

class ArrayContainsExample {
    @Body()
    @List('number')
    @ArrayContains([1, 2])
    numbers!: number[]

    @Body()
    @List(ArrayContainsNested)
    @ArrayContains([{ name: 'test1' }])
    objects!: ArrayContainsNested[]

    @Body()
    @List(Date)
    @ArrayContains([new Date('2024-01-01')])
    dates!: Date[]

    @Body()
    @Type(data => {
        if (typeof data !== 'object' || data === null) return Number
        else return ArrayContainsNested
    })
    @ArrayContains([1, { name: 'test1' }])
    mixed!: (number | ArrayContainsNested)[]

    @Body()
    @List('string')
    @ArrayContains(['hello', 'world'], (expected, actual) => typeof actual === 'string' && actual.toLowerCase() === expected.toLowerCase())
    strings!: string[]
}

router.post('/array-contains', bindingCargo(ArrayContainsExample), (req, res) => {
    const cargo = getCargo<ArrayContainsExample>(req)
    res.json(cargo)
})

class ArrayMaxSizeExample {
    @Body()
    @List('number')
    @ArrayMaxSize(5)
    numbers!: number[]

    @Body()
    @List('string')
    @ArrayMaxSize(3)
    tags!: string[]
}

router.post('/array-max-size', bindingCargo(ArrayMaxSizeExample), (req, res) => {
    const cargo = getCargo<ArrayMaxSizeExample>(req)
    res.json(cargo)
})

export default router
