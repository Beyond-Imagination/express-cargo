import express, { Router } from 'express'
import { bindingCargo, Body, getCargo, Query, Request, Transform, Virtual } from 'express-cargo'

const router: Router = express.Router()

class TransformExample {
    @Query()
    @Transform((value: string) => value.toLowerCase())
    sortBy!: string

    @Query()
    @Transform((value: number) => value * 2)
    count!: number
}

router.get('/transform', bindingCargo(TransformExample), (req, res) => {
    const cargo = getCargo<TransformExample>(req)

    res.json({
        message: 'Search parameters transformed successfully!',
        data: cargo,
        sortByType: typeof cargo?.sortBy,
        countType: typeof cargo?.count,
        doubleCount: cargo?.count,
    })
})

class RequestExample {
    @Request(req => req?.headers['x-custom-header'] as string)
    customHeader!: string
}

router.post('/request', bindingCargo(RequestExample), (req, res) => {
    const cargo = getCargo<RequestExample>(req)

    res.json({
        message: 'Header data mapped using @request',
        data: cargo,
    })
})

class VirtualExample {
    @Body()
    price!: number

    @Body()
    quantity!: number

    @Virtual((obj: VirtualExample) => obj.price * obj.quantity)
    total!: number
}

router.post('/virtual', bindingCargo(VirtualExample), (req, res) => {
    const cargo = getCargo<VirtualExample>(req)
    res.json({
        message: 'Order data processed with @virtual',
        data: cargo,
    })
})

export default router
