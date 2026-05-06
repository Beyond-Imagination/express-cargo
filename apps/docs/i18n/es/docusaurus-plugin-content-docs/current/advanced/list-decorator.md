# Decorador `@List`

El decorador `@List` de Express-Cargo permite enlazar y convertir automáticamente arrays desde una solicitud. Es útil cuando esperas que un campo sea un array de un tipo específico, como cadenas, números o incluso objetos personalizados.

## Ejemplo de uso

```typescript
import express, { Router } from 'express'
import { Body, List, bindingCargo, getCargo } from 'express-cargo'

const router: Router = express.Router()

// 1. Define una clase personalizada (opcional)
class CustomClass {
    @Body()
    name!: string

    @Body()
    age!: number
}

// 2. Define la clase con campos de array
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

// 3. Configura la ruta de Express
router.post('/list', bindingCargo(ListSample), (req, res) => {
    const cargo = getCargo<ListSample>(req)
    res.json(cargo)
})

export default router
```

## Ejemplo de salida

Si envías una solicitud POST a `/list` con el siguiente cuerpo JSON:

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

La función `getCargo` devuelve un objeto `ListSample` completamente inicializado:

```typescript
// Objeto devuelto por getCargo<ListSample>(req):
const cargo = {
  stringArray: ["apple", "banana"],
  numberArray: [1, 2, 3],
  booleanArray: [true, false],
  dateArray: [
    // Estos son objetos Date reales
    new Date("2024-01-01T00:00:00.000Z"),
    new Date("2024-01-02T00:00:00.000Z")
  ],
  stringLiteralArray: ["one", "two"],
  customClassArray: [
    // Estas son instancias de CustomClass
    { name: "John", age: 30 },
    { name: "Jane", age: 25 }
  ]
};
```
