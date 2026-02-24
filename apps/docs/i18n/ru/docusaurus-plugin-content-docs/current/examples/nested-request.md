# Обработка вложенных запросов

Этот пример демонстрирует, как **Express-Cargo** может заполнять вложенные запросы, позволяя вам сопоставлять сложные, структурированные данные запроса в единый, хорошо организованный объект.

## 1. Определите ваши запросы

В этом сценарии мы определим два класса: `UserInfoRequest` и `OrderRequest`. Класс `UserInfoRequest` извлекает данные пользователя из тела запроса и токен аутентификации из заголовков.

**`UserInfoRequest`** – Сопоставляет данные пользователя из тела запроса и извлекает токен авторизации из заголовков.

```typescript
// user.request.ts
import { Body, Header, Optional, Prefix, Transform } from 'express-cargo'

export class UserInfoRequest {
    @Body('name')
    name!: string

    @Body('email')
    @Prefix('user-')
    email!: string

    @Body('age')
    @Optional()
    age?: number

    // Извлекает токен из заголовка Authorization.
    @Header('authorization')
    @Transform((value: string) => {
        if (value.startsWith('Bearer ')) {
            return value.substring(7);
        }
        return ''
    })
    authorization!: string
}
```

**`OrderRequest`** – Представляет запрос заказа, включая вложенный `UserInfoRequest`.

```typescript
// order.request.ts
import { Body, Min, Max } from 'express-cargo'
import { UserInfoRequest } from './user.request'

export class OrderRequest {
    @Body('productId')
    productId!: string

    @Body('quantity')
    @Min(1)
    @Max(10)
    quantity!: number

    @Body('user')
    user!: UserInfoRequest
}
```

В `UserInfoRequest` мы используем декоратор `@header` для свойства `authorization`, чтобы получить значение из заголовка `Authorization`. Затем декоратор `@transform` извлекает только значение токена, удаляя префикс `"Bearer "`.

## 2. Использование в маршруте Express

Просто примените промежуточное ПО `bindingCargo` к вашему маршруту с запросом верхнего уровня, `OrderRequest`. Промежуточное ПО обработает всю логику привязки за вас.

```typescript
router.post('/orders', bindingCargo(OrderRequest), (req, res) => {
    const order = getCargo<OrderRequest>(req)

    if (order) {
        console.log(`Processing order for product: ${order.productId}`)
        console.log(`User name: ${order.user.name}`)
        console.log(`Auth token: ${order.user.authorization}`)

        // Теперь вы можете использовать токен авторизации для валидации или другой логики.
        res.json({ message: 'Заказ получен', order })
    }
})
```

## 3. Пример запроса

Этот маршрут успешно обработает запрос, который имеет как тело, так и заголовок `Authorization`.

- Тело запроса:
    ```json
    {
        "productId": "SKU-456",
        "quantity": 5,
        "user": {
            "name": "Jane Doe",
            "email": "user-jane@example.com"
        }
    }
    ```

- Заголовки запроса:

    ```
    Authorization: Bearer my-auth-token-12345
    ```

При обработке `getCargo(req)` вернет один объект `OrderRequest`, который содержит все данные, при этом свойство `authorization` будет корректно заполнено из заголовка. Это демонстрирует, как **Express-Cargo** элегантно объединяет несколько источников данных в один чистый объект.

## 4. Пример результата

Итоговый привязанный объект `OrderRequest`:

```json
{
    "productId": "SKU-456",
    "quantity": 5,
    "user": {
        "name": "Jane Doe",
        "email": "user-jane@example.com",
        "authorization": "my-auth-token-12345"
    }
}
```
