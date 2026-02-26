import express, { Router } from 'express'
import { Body, List, bindingCargo, getCargo, Uri, Enum } from 'express-cargo'

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

class ListSample {
    @Body()
    @List(String)
    stringArray!: string[]

    @Body()
    @List(Number)
    numberArray!: number[]

    @Body()
    @List(Boolean)
    booleanArray!: boolean[]

    @Body()
    @List(Date)
    dateArray!: Date[]

    @Body()
    @List('string')
    stringLiteralArray!: string[]

    @Body()
    @List(CustomClass)
    customClassArray!: CustomClass[]
}

router.post('/list', bindingCargo(ListSample), (req, res) => {
    const cargo = getCargo<ListSample>(req)
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
