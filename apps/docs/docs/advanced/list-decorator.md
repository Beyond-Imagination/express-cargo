# List Decorator

Express-Cargo's `@List` decorator allows you to automatically bind and cast array types from a request. This is useful when you expect a field to be an array of a specific type, like strings, numbers, or even custom objects.

## Usage Example

```typescript
import express, { Router } from 'express'
import { Body, List, bindingCargo, getCargo } from 'express-cargo'

const router: Router = express.Router()

// 1. Define a custom class (optional)
class CustomClass {
    @Body()
    name!: string

    @Body()
    age!: number
}

// 2. Define the class with array fields
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

// 3. Setup Express route
router.post('/list', bindingCargo(ListSample), (req, res) => {
    const cargo = getCargo<ListSample>(req)
    res.json(cargo)
})

export default router
```

## Output Example

If you send a POST request to `/list` with the following JSON body:

```json
{
    "stringArray": ["apple", "banana"],
    "numberArray": [1, 2, 3],
    "booleanArray": [true, false],
    "dateArray": ["2024-01-01", "2024-01-02"],
    "stringLiteralArray": ["one", "two"],
    "customClassArray": [
        { "name": "John", "age": 30 },
        { "name": "Jane", "age": 25 }
    ]
}
```

The `getCargo` function will return a fully populated `ListSample` object:

```typescript
// Object returned by getCargo<ListSample>(req):
const cargo = {
  stringArray: ["apple", "banana"],
  numberArray: [1, 2, 3],
  booleanArray: [true, false],
  dateArray: [
    // These are actual Date objects
    new Date("2024-01-01T00:00:00.000Z"),
    new Date("2024-01-02T00:00:00.000Z")
  ],
  stringLiteralArray: ["one", "two"],
  customClassArray: [
    // These are instances of CustomClass
    { name: "John", age: 30 },
    { name: "Jane", age: 25 }
  ]
};
```
