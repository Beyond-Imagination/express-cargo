# Décorateur de liste

Le décorateur `@List` d'Express-Cargo vous permet de lier et de convertir automatiquement les types de tableau depuis une requête. Ceci est utile lorsque vous attendez qu'un champ soit un tableau d'un type spécifique, comme des chaînes, des nombres ou même des objets personnalisés.

## Exemple d'utilisation

```typescript
import express, { Router } from 'express'
import { Body, List, bindingCargo, getCargo } from 'express-cargo'

const router: Router = express.Router()

// 1. Définir une classe personnalisée (optionnelle)
class CustomClass {
    @Body()
    name!: string

    @Body()
    age!: number
}

// 2. Définir la classe avec des champs de tableau
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

// 3. Configuration de la route Express
router.post('/list', bindingCargo(ListSample), (req, res) => {
    const cargo = getCargo<ListSample>(req)
    res.json(cargo)
})

export default router
```

## Exemple de sortie

Si vous envoyez une requête POST à `/list` avec le corps JSON suivant :

```json
{
    "stringArray": ["pomme", "banane"],
    "numberArray": [1, 2, 3],
    "booleanArray": [true, false],
    "dateArray": ["2024-01-01", "2024-01-02"],
    "stringLiteralArray": ["un", "deux"],
    "customClassArray": [
        { "name": "Jean", "age": 30 },
        { "name": "Jeanne", "age": 25 }
    ]
}
```

La fonction `getCargo` retournera un objet `ListSample` entièrement peuplé :

```typescript
// Objet retourné par getCargo<ListSample>(req) :
const cargo = {
  stringArray: ["pomme", "banane"],
  numberArray: [1, 2, 3],
  booleanArray: [true, false],
  dateArray: [
    // Ce sont des objets Date réels
    new Date("2024-01-01T00:00:00.000Z"),
    new Date("2024-01-02T00:00:00.000Z")
  ],
  stringLiteralArray: ["un", "deux"],
  customClassArray: [
    // Ce sont des instances de CustomClass
    { name: "Jean", age: 30 },
    { name: "Jeanne", age: 25 }
  ]
};
```
