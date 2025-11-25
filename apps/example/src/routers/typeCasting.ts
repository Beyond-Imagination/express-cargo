import express, { Router } from 'express'
import { body, array, bindingCargo, getCargo, uri, Enum } from 'express-cargo'

const router: Router = express.Router()

class CustomClass {
    @body()
    name!: string

    @body()
    age!: number
}

class BasicTypeSample {
    @body()
    string!: string

    @uri()
    number!: number

    @body()
    boolean!: boolean

    @body()
    date!: Date

    @body()
    customObject!: CustomClass
}

router.post('/type-casting/:number', bindingCargo(BasicTypeSample), (req, res) => {
    const cargo = getCargo<BasicTypeSample>(req)
    res.json(cargo)
})

class ArraySample {
    @body()
    @array(String)
    stringArray!: string[]

    @body()
    @array(Number)
    numberArray!: number[]

    @body()
    @array(Boolean)
    booleanArray!: boolean[]

    @body()
    @array(Date)
    dateArray!: Date[]

    @body()
    @array('string')
    stringLiteralArray!: string[]

    @body()
    @array(CustomClass)
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
    @body()
    @Enum(Role)
    role!: Role

    @body()
    @Enum(StringRole)
    stringRole!: StringRole
}

router.post('/enum', bindingCargo(EnumSample), (req, res) => {
    const cargo = getCargo<EnumSample>(req)
    console.log('role : ', cargo?.role)
    console.log('string role : ', cargo?.stringRole)
    res.json(cargo)
})

export default router
