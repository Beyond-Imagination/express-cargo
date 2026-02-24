# Декораторы виртуальных полей

**Express-Cargo** предоставляет декораторы для определения **виртуальных полей** и **полей, производных от запроса**. Эти декораторы позволяют динамически вычислять значения или сопоставлять данные из `Request` непосредственно со свойством объекта.

## Встроенные виртуальные декораторы

### `@Virtual<T>(transformer: (obj: object) => T)`

Декоратор `@Virtual` определяет **вычисляемое свойство**, которое не получается напрямую из запроса. Вместо этого его значение выводится из других свойств объекта.

- **`transformer`**: Функция, которая получает экземпляр объекта и возвращает вычисленное значение.

### `@Request<T>(transformer: (req: Request) => T)`

Декоратор `@Request` сопоставляет значение из объекта Express `Request` со свойством класса.

- **`transformer`**: Функция, которая получает объект Request и возвращает значение для привязки.

## Пример использования

```typescript
import express from 'express'
import { Body, Virtual, Request, bindingCargo, getCargo } from 'express-cargo'

// 1. Определите объект с виртуальными и производными от запроса полями
class OrderExample {
    @Body('price')
    price!: number

    @Body('quantity')
    quantity!: number

    // Вычисляемое поле, отсутствующее в запросе
    @Virtual((obj: OrderExample) => obj.price * obj.quantity)
    total!: number
}

class HeaderExample {
    // Поле, полученное непосредственно из объекта запроса
    @Request(req => req.headers['x-custom-header'] as string)
    customHeader!: string
}

// 2. Настройте приложение Express и маршрут
const app = express()
app.use(express.json())

app.post('/orders', bindingCargo(OrderExample), (req, res) => {
    const orderData = getCargo<OrderExample>(req)
    res.json({
        message: 'Данные заказа обработаны с виртуальными полями!',
        data: orderData
    })
})

app.post('/headers', bindingCargo(HeaderExample), (req, res) => {
    const headerData = getCargo<HeaderExample>(req)
    res.json({
        message: 'Данные заголовка сопоставлены с помощью @request!',
        data: headerData
    })
})

/*
Чтобы протестировать эти конечные точки, отправьте POST-запросы с соответствующим телом или заголовками:

Пример тела /orders:
{
    "price": 50,
    "quantity": 2
}

Пример заголовков /headers:
x-custom-header: my-header-value
*/
```
