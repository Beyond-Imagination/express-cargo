# Декораторы виртуальных полей

**Express-Cargo** предоставляет декораторы для определения **виртуальных полей** и **полей, производных от запроса**. Эти декораторы позволяют динамически вычислять значения или сопоставлять данные из `Request` непосредственно со свойством объекта.

## Встроенные виртуальные декораторы

### `@Virtual<T>(transformer: (obj: object) => T)`

Декоратор `@Virtual` определяет **вычисляемое свойство**, которое не получается напрямую из запроса. Вместо этого его значение выводится из других свойств объекта.

- **`transformer`**: Функция, которая получает экземпляр объекта и возвращает вычисленное значение.

### `@Request<T>(transformer: (req: Request) => T)`

Декоратор `@Request` сопоставляет значение из объекта Express `Request` со свойством класса.

- **`transformer`**: Функция, которая получает объект Request и возвращает значение для привязки.

`@Request` присваивает возвращённое значение без изменений и без встроенного приведения типов. Типичный пример использования — привязка пользователя, которого middleware аутентификации, например Passport.js, сохранил в `req.user`.

## Пример использования

```typescript
import express from 'express'
import passport from 'passport'
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { Body, Virtual, Request, bindingCargo, getCargo } from 'express-cargo'

class OrderExample {
    @Body('price')
    price!: number

    @Body('quantity')
    quantity!: number

    // Вычисляемое поле, отсутствующее в запросе
    @Virtual((obj: OrderExample) => obj.price * obj.quantity)
    total!: number
}

class PassportExample {
    @Request<object>(req => req.user!)
    user!: object
}

const EXAMPLE_TOKEN = 'express-cargo-token'

passport.use(
    new BearerStrategy((token, done) => {
        if (token !== EXAMPLE_TOKEN) {
            return done(null, false)
        }

        return done(null, { id: 'test-user-id', role: 'admin' })
    }),
)

const app = express()
app.use(express.json())
app.use(passport.initialize())

app.post('/orders', bindingCargo(OrderExample), (req, res) => {
    const orderData = getCargo<OrderExample>(req)
    res.json({
        message: 'Данные заказа обработаны с виртуальными полями!',
        data: orderData,
    })
})

app.get('/passport', passport.authenticate('bearer', { session: false }), bindingCargo(PassportExample), (req, res) => {
    const cargo = getCargo<PassportExample>(req)
    res.json(cargo)
})
```

Аутентификация Passport должна выполняться до `bindingCargo()`. После успешной аутентификации Passport устанавливает `req.user`, а `@Request<object>` привязывает этот объект к `PassportExample.user`. Отсутствующие или недействительные учётные данные отклоняются Passport до выполнения cargo binding.

```shell
curl 'http://localhost:3000/passport' \
    -H 'Authorization: Bearer express-cargo-token'
```

```json
{
    "user": {
        "id": "test-user-id",
        "role": "admin"
    }
}
```

Тип `object` делает пример независимым от пользовательской модели приложения. Если коду нужен доступ к свойствам вроде `user.id`, замените `object` конкретным типом пользователя и передайте этот тип в `@Request<T>`.
