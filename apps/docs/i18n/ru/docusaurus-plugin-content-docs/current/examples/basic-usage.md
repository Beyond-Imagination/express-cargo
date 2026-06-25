# Базовое использование

Этот пример показывает простейший сквозной поток **express-cargo**: определить класс запроса, привязать его с помощью middleware `bindingCargo` и прочитать проверенный результат через `getCargo`.

> Эта страница посвящена только потоку привязки. Настройку проекта (TypeScript, `tsconfig`, установка зависимостей) см. в разделе [Начало работы](../getting-started.md).

## 1. Определить класс запроса

Объявите класс и используйте декоратор источника (здесь `@Body()`), чтобы сопоставить каждое поле с частью входящего запроса.

```typescript
// create-user.request.ts
import { Body } from 'express-cargo'

export class CreateUserRequest {
    @Body('name')
    name!: string

    @Body('email')
    email!: string
}
```

## 2. Применить middleware

Передайте класс запроса в `bindingCargo` и зарегистрируйте его как middleware на маршруте. Middleware привязывает и проверяет запрос до выполнения вашего обработчика.

```typescript
import express from 'express'
import { bindingCargo, getCargo } from 'express-cargo'
import { CreateUserRequest } from './create-user.request'

const app = express()
app.use(express.json())

app.post('/users', bindingCargo(CreateUserRequest), (req, res) => {
    // 3. Прочитать привязанный типобезопасный объект
    const user = getCargo<CreateUserRequest>(req)

    res.json({
        message: 'User created!',
        data: user,
    })
})
```

## 3. Пример запроса

```json
{
    "name": "Jane Doe",
    "email": "jane@example.com"
}
```

## 4. Пример результата

`getCargo<CreateUserRequest>(req)` возвращает полностью заполненный экземпляр `CreateUserRequest`:

```json
{
    "message": "User created!",
    "data": {
        "name": "Jane Doe",
        "email": "jane@example.com"
    }
}
```

## Дальнейшие шаги

- Получение данных из других источников (`@Query`, `@Header`, `@Params`) — см. [Декораторы источника](../decorators/source-decorators.md)
- Добавление правил валидации, таких как `@Min`, `@Email` — см. [Декораторы валидации](../decorators/validators.md)
- Привязка вложенных объектов — см. [Обработка вложенных запросов](./nested-request.md)
- Обработка ошибок валидации — см. [Обработка ошибок](./validation-errors.md)
