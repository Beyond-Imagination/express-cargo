import express, { Router } from 'express'
import multer from 'multer'
import { bindingCargo, getCargo, Body, File, Files } from 'express-cargo'

const router: Router = express.Router()

const upload = multer({ storage: multer.memoryStorage() })

function summarize(file?: Express.Multer.File) {
    if (!file) return null
    return {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
    }
}

class UploadAvatarRequest {
    @Body('username')
    username!: string

    @File()
    avatar!: Express.Multer.File
}

router.post('/upload/avatar', upload.single('avatar'), bindingCargo(UploadAvatarRequest), (req, res) => {
    const cargo = getCargo<UploadAvatarRequest>(req)
    res.json({ username: cargo.username, avatar: summarize(cargo.avatar) })
})

class UploadGalleryRequest {
    @Files('photos')
    photos!: Express.Multer.File[]
}

router.post('/upload/gallery', upload.array('photos'), bindingCargo(UploadGalleryRequest), (req, res) => {
    const cargo = getCargo<UploadGalleryRequest>(req)
    res.json({ count: cargo.photos.length, photos: cargo.photos.map(summarize) })
})

class UploadProfileRequest {
    @Body('bio')
    bio!: string

    @File('avatar')
    avatar!: Express.Multer.File

    @Files('gallery')
    gallery!: Express.Multer.File[]
}

router.post(
    '/upload/profile',
    upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery' }]),
    bindingCargo(UploadProfileRequest),
    (req, res) => {
        const cargo = getCargo<UploadProfileRequest>(req)
        res.json({
            bio: cargo.bio,
            avatar: summarize(cargo.avatar),
            gallery: cargo.gallery.map(summarize),
        })
    },
)

export default router
