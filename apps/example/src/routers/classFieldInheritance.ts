import { bindingCargo, body, getCargo, length } from 'express-cargo'
import express, { Router } from 'express'

const router: Router = express.Router()

class BaseSample {
    @body()
    @length(4)
    baseText!: string
}

class Sample extends BaseSample {
    @body()
    @length(5)
    stringText!: string
}

class FieldSample {
    @body()
    sample!: Sample
}

router.post('/class-field-inheritance', bindingCargo(FieldSample), (req, res) => {
    const cargo = getCargo<FieldSample>(req)
    res.json(cargo)
})

export default router
