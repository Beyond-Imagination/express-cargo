import { bindingCargo, Body, getCargo, Length } from 'express-cargo'
import express, { Router } from 'express'

const router: Router = express.Router()

class BaseSample {
    @Body()
    @Length(4)
    baseText!: string
}

class Sample extends BaseSample {
    @Body()
    @Length(5)
    stringText!: string
}

class FieldSample {
    @Body()
    sample!: Sample
}

router.post('/class-field-inheritance', bindingCargo(FieldSample), (req, res) => {
    const cargo = getCargo<FieldSample>(req)
    res.json(cargo)
})

export default router
