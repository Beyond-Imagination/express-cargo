# Manejo de solicitudes anidadas

Este ejemplo muestra cómo **Express-Cargo** puede rellenar clases de solicitud anidadas, permitiéndote organizar datos de solicitud complejos y estructurados en un único objeto bien definido.

## 1. Define tus clases de solicitud

En este escenario, definiremos dos clases: `UserInfoRequest` y `OrderRequest`. La clase `UserInfoRequest` extrae detalles del usuario desde el cuerpo de la solicitud y un token de autenticación desde los encabezados.

**`UserInfoRequest`** – Asigna detalles del usuario desde el cuerpo de la solicitud y extrae el token de autorización desde los encabezados.

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

    // Extrae el token del encabezado Authorization.
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

**`OrderRequest`** – Representa una solicitud de pedido e incluye un `UserInfoRequest` anidado.

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

En `UserInfoRequest`, usamos el decorador `@Header` en la propiedad `authorization` para obtener el valor del encabezado `Authorization`. Después, el decorador `@Transform` extrae solo el valor del token, eliminando el prefijo `"Bearer "`.

## 2. Uso en una ruta Express

Simplemente aplica el middleware `bindingCargo` a tu ruta con la clase de solicitud de nivel superior, `OrderRequest`. El middleware gestionará toda la lógica de enlace por ti.

```typescript
router.post('/orders', bindingCargo(OrderRequest), (req, res) => {
    const order = getCargo<OrderRequest>(req)

    if (order) {
        console.log(`Procesando pedido para el producto: ${order.productId}`)
        console.log(`Nombre de usuario: ${order.user.name}`)
        console.log(`Token de autenticación: ${order.user.authorization}`)

        // Ahora puedes usar el token de autenticación para validación u otra lógica.
        res.json({ message: 'Pedido recibido', order })
    }
})
```

## 3. Solicitud de ejemplo

Esta ruta procesará correctamente una solicitud que tiene tanto un cuerpo como un encabezado `Authorization`.

- Cuerpo de la solicitud:
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

- Encabezados de la solicitud:

    ```
    Authorization: Bearer my-auth-token-12345
    ```

Cuando se procese, `getCargo(req)` devolverá un único objeto `OrderRequest` que contiene todos los datos, con la propiedad `authorization` correctamente rellenada desde el encabezado. Esto demuestra cómo **Express-Cargo** unifica de forma elegante múltiples fuentes de datos en un objeto limpio.

## 4. Resultado de ejemplo

Objeto final `OrderRequest` enlazado:

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
