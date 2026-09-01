import express, { Router } from 'express'
import { bindingCargo, Body, getCargo, Type } from 'express-cargo'

const router: Router = express.Router()

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
