import express, { Router } from 'express'
import { Body, Array, bindingCargo, getCargo, Uri, Enum } from 'express-cargo'

const router: Router = express.Router()

class CustomClass {
    @Body()
    name!: string

    @Body()
    age!: number
}

class BasicTypeSample {
    @Body()
    string!: string

    @Uri()
    number!: number

    @Body()
    boolean!: boolean

    @Body()
    date!: Date

    @Body()
    customObject!: CustomClass
}

router.post('/type-casting/:number', bindingCargo(BasicTypeSample), (req, res) => {
    const cargo = getCargo<BasicTypeSample>(req)
    res.json(cargo)
})

class ArraySample {
    @Body()
    @Array(String)
    stringArray!: string[]

    @Body()
    @Array(Number)
    numberArray!: number[]

    @Body()
    @Array(Boolean)
    booleanArray!: boolean[]

    @Body()
    @Array(Date)
    dateArray!: Date[]

    @Body()
    @Array('string')
    stringLiteralArray!: string[]

    @Body()
    @Array(CustomClass)
    customClassArray!: CustomClass[]
}

router.post('/array', bindingCargo(ArraySample), (req, res) => {
    const cargo = getCargo<ArraySample>(req)
    res.json(cargo)
})

enum Role {
    ADMIN,
    USER,
}

enum StringRole {
    ADMIN = 'admin',
    USER = 'user',
}
class EnumSample {
    @Body()
    @Enum(Role)
    role!: Role

    @Body()
    @Enum(StringRole)
    stringRole!: StringRole
}

router.post('/enum', bindingCargo(EnumSample), (req, res) => {
    const cargo = getCargo<EnumSample>(req)
    console.log('role is enum? : ', cargo?.role === Role.ADMIN)
    console.log('string role is enum? : ', cargo?.stringRole === StringRole.USER)
    res.json(cargo)
})

export default router
