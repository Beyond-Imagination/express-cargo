# Декоратор списка

Декоратор `@List` в Express-Cargo позволяет автоматически привязывать и приводить типы массивов из запроса. Это полезно, когда вы ожидаете, что поле будет массивом определенного типа, например, строк, чисел или даже пользовательских объектов.

## Пример использования

```typescript
import express, { Router } from 'express'
import { Body, List, bindingCargo, getCargo } from 'express-cargo'

const router: Router = express.Router()

// 1. Определите пользовательский класс (необязательно)
class CustomClass {
    @Body()
    name!: string

    @Body()
    age!: number
}

// 2. Определите класс с полями массива
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

// 3. Настройте маршрут Express
router.post('/list', bindingCargo(ListSample), (req, res) => {
    const cargo = getCargo<ListSample>(req)
    res.json(cargo)
})

export default router
```

## Пример вывода

Если вы отправите POST-запрос на `/list` со следующим телом JSON:

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

Функция `getCargo` вернет полностью заполненный объект `ListSample`:

```typescript
// Объект, возвращаемый getCargo<ListSample>(req):
const cargo = {
  stringArray: ["apple", "banana"],
  numberArray: [1, 2, 3],
  booleanArray: [true, false],
  dateArray: [
    // Это настоящие объекты Date
    new Date("2024-01-01T00:00:00.000Z"),
    new Date("2024-01-02T00:00:00.000Z")
  ],
  stringLiteralArray: ["one", "two"],
  customClassArray: [
    // Это экземпляры CustomClass
    { name: "John", age: 30 },
    { name: "Jane", age: 25 }
  ]
};
```
