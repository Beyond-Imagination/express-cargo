# Привязка вложенных объектов

Express-Cargo позволяет обрабатывать вложенные объекты в запросах, автоматически привязывая их к вложенным объектам, поддерживая при этом рекурсивное приведение типов и валидацию.

## Пример использования

```typescript
import express, { Request, Response } from 'express'
import { Body, bindingCargo, getCargo } from 'express-cargo'

// 1. Определите вложенный объект
class Profile {
    @Body('nickname')
    nickname!: string
}

class ExampleObject {
    @Body('profile')
    profile!: Profile
}

// 2. Настройте приложение Express и маршрут
const app = express()
app.use(express.json())

app.post('/submit', bindingCargo(ExampleObject), (req: Request, res: Response) => {
    const requestData = getCargo<ExampleObject>(req)

    res.json({
        message: 'Вложенный объект успешно привязан!',
        data: requestData,
    })
})

/*
Чтобы протестировать эту конечную точку, отправьте POST-запрос на /submit.

Пример URL запроса:
http://localhost:3000/submit
*/
```

## Пример вывода

Когда отправляется POST-запрос с вложенным объектом профиля, промежуточное ПО `bindingCargo` автоматически создает экземпляр и валидирует вложенный `ExampleObject`. Затем функция `getCargo` возвращает полностью заполненный объект с вложенными данными:

```json
{
    "message": "Вложенный объект успешно привязан!",
    "data": {
        "profile": {
            "nickname": "coder123"
        }
    }
}
```
