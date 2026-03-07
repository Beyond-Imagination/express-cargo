# Listen-Decorator

Der `@List`-Decorator von Express-Cargo ermöglicht es Ihnen, Array-Typen aus einer Anfrage automatisch zu binden und zu casten. Dies ist nützlich, wenn Sie erwarten, dass ein Feld ein Array eines bestimmten Typs ist, wie Strings, Zahlen oder sogar benutzerdefinierte Objekte.

## Anwendungsbeispiel

```typescript
import express, { Router } from 'express'
import { Body, List, bindingCargo, getCargo } from 'express-cargo'

const router: Router = express.Router()

// 1. Definieren Sie eine benutzerdefinierte Klasse (optional)
class CustomClass {
    @Body()
    name!: string

    @Body()
    age!: number
}

// 2. Definieren Sie die Klasse mit Array-Feldern
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

// 3. Express-Route einrichten
router.post('/list', bindingCargo(ListSample), (req, res) => {
    const cargo = getCargo<ListSample>(req)
    res.json(cargo)
})

export default router
```

## Ausgabebeispiel

Wenn Sie eine POST-Anfrage an `/list` mit dem folgenden JSON-Body senden:

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

Die `getCargo`-Funktion gibt ein vollständig gefülltes `ListSample`-Objekt zurück:

```typescript
// Von getCargo<ListSample>(req) zurückgegebenes Objekt:
const cargo = {
  stringArray: ["apple", "banana"],
  numberArray: [1, 2, 3],
  booleanArray: [true, false],
  dateArray: [
    // Dies sind tatsächliche Date-Objekte
    new Date("2024-01-01T00:00:00.000Z"),
    new Date("2024-01-02T00:00:00.000Z")
  ],
  stringLiteralArray: ["one", "two"],
  customClassArray: [
    // Dies sind Instanzen von CustomClass
    { name: "John", age: 30 },
    { name: "Jane", age: 25 }
  ]
};
```
