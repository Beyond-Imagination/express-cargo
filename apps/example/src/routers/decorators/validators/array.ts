import express, { Router } from 'express'
import {
    bindingCargo,
    getCargo,
    Body,
    Each,
    List,
    ListContains,
    ListMaxSize,
    ListMinSize,
    ListNotContains,
    MaxLength,
    MinLength,
    Type,
} from 'express-cargo'

const router: Router = express.Router()

class ListContainsNested {
    @Body()
    name!: string
}

class ListContainsExample {
    @Body()
    @List('number')
    @ListContains([1, 2])
    numbers!: number[]

    @Body()
    @List(ListContainsNested)
    @ListContains([{ name: 'test1' }])
    objects!: ListContainsNested[]

    @Body()
    @List(Date)
    @ListContains([new Date('2024-01-01')])
    dates!: Date[]

    @Body()
    @Type(data => {
        if (typeof data !== 'object' || data === null) return Number
        else return ListContainsNested
    })
    @ListContains([1, { name: 'test1' }])
    mixed!: (number | ListContainsNested)[]

    @Body()
    @List('string')
    @ListContains(['hello', 'world'], (expected, actual) => typeof actual === 'string' && actual.toLowerCase() === expected.toLowerCase())
    strings!: string[]
}

router.post('/list-contains', bindingCargo(ListContainsExample), (req, res) => {
    const cargo = getCargo<ListContainsExample>(req)
    res.json(cargo)
})

class ListNotContainsNested {
    @Body()
    name!: string
}

class ListNotContainsExample {
    @Body()
    @List('number')
    @ListNotContains([1, 2])
    numbers!: number[]

    @Body()
    @List(ListNotContainsNested)
    @ListNotContains([{ name: 'banned' }])
    objects!: ListNotContainsNested[]

    @Body()
    @List(Date)
    @ListNotContains([new Date('2024-01-01')])
    dates!: Date[]

    @Body()
    @List('string')
    @ListNotContains(['hello', 'world'], (expected, actual) => typeof actual === 'string' && actual.toLowerCase() === expected.toLowerCase())
    strings!: string[]
}

router.post('/list-not-contain', bindingCargo(ListNotContainsExample), (req, res) => {
    const cargo = getCargo<ListNotContainsExample>(req)
    res.json(cargo)
})

class ListMaxSizeExample {
    @Body()
    @List('number')
    @ListMaxSize(5)
    numbers!: number[]

    @Body()
    @List('string')
    @ListMaxSize(3)
    tags!: string[]
}

router.post('/list-max-size', bindingCargo(ListMaxSizeExample), (req, res) => {
    const cargo = getCargo<ListMaxSizeExample>(req)
    res.json(cargo)
})

class ListMinSizeExample {
    @Body()
    @List('number')
    @ListMinSize(3)
    numbers!: number[]

    @Body()
    @List('string')
    @ListMinSize(1)
    tags!: string[]
}

router.post('/list-min-size', bindingCargo(ListMinSizeExample), (req, res) => {
    const cargo = getCargo<ListMinSizeExample>(req)
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

export default router
