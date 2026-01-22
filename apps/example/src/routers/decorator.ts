import express, { Router } from 'express'
import { bindingCargo, Body, Default, Each, getCargo, Length, MaxLength, MinLength, Type } from 'express-cargo'

const router: Router = express.Router()

class DefaultExample {
    @Body()
    @Default(3)
    number!: number

    @Body()
    @Default('2')
    string!: string

    @Body()
    @Default(false)
    boolean!: boolean
}

router.post('/default', bindingCargo(DefaultExample), (req, res) => {
    const cargo = getCargo<DefaultExample>(req)
    res.json(cargo)
})

class EachExample {
    @Body()
    @Each(MinLength(5), MaxLength(20))
    tags!: string[]

    @Body()
    @Each((val: number) => val % 2 === 0)
    evenNumbers!: number[]
}

router.post('/each', bindingCargo(EachExample), (req, res) => {
    const cargo = getCargo<EachExample>(req)
    res.json(cargo)
})

class User {
    @Body()
    name!: string
}

class Profile {
    @Body()
    bio!: string

    @Body()
    @Type(() => User)
    user!: User
}

abstract class Media {
    @Body()
    type!: 'video' | 'image'
}

class Video extends Media {
    @Body()
    duration!: number
}

class Image extends Media {
    @Body()
    format!: string
}

class TypeTest {
    @Body()
    name!: string

    @Body()
    @Type(() => Profile)
    profile!: Profile

    @Body()
    @Type(data => (data.type === 'video' ? Video : Image))
    featuredMedia!: Video | Image

    @Body()
    @Type(data => (data.type === 'video' ? Video : Image))
    gallery!: (Video | Image)[]
}

router.post('/type', bindingCargo(TypeTest), (req, res) => {
    const cargo = getCargo<TypeTest>(req)
    res.json(cargo)
})

export default router
