# Array Decorator

Express-Cargo's `@array` decorator allows you to automatically bind and cast array types from a request. This is useful when you expect a field to be an array of a specific type, like strings, numbers, or even custom objects.

## Usage Example

```typescript
import express, { Router } from 'express'
import { body, array, bindingCargo, getCargo } from 'express-cargo'

const router: Router = express.Router()

// 1. Define a custom class (optional)
class CustomClass {
    @body()
    name!: string

    @body()
    age!: number
}

// 2. Define the class with array fields
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

// 3. Setup Express route
router.post('/array', bindingCargo(ArraySample), (req, res) => {
    const cargo = getCargo<ArraySample>(req)
    res.json(cargo)
})

export default router
```

## Output Example

If you send a POST request to `/array` with the following JSON body:

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

The `getCargo` function will return a fully populated `ArraySample` object:

```typescript
// Object returned by getCargo<ArraySample>(req):
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
