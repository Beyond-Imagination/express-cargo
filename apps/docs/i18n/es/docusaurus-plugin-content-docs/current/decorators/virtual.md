# Decoradores de campos virtuales

**Express-Cargo** proporciona decoradores para definir **campos virtuales** y **campos derivados de la solicitud**. Estos decoradores te permiten calcular valores dinámicamente o asignar datos directamente desde el `Request` a una propiedad del objeto.

## Decoradores virtuales integrados

### `@Virtual<T>(transformer: (obj: object) => T)`

El decorador `@Virtual` define una **propiedad calculada** que no proviene directamente de la solicitud. En su lugar, su valor se deriva de otras propiedades del objeto.

- **`transformer`**: Una función que recibe la instancia del objeto y devuelve el valor calculado.

### `@Request<T>(transformer: (req: Request) => T)`

El decorador `@Request` asigna un valor desde el objeto `Request` de Express a una propiedad de clase.

- **`transformer`**: Una función que recibe el objeto Request y devuelve el valor que se enlazará.

## Ejemplo de uso

```typescript
import express from 'express'
import { Body, Virtual, Request, bindingCargo, getCargo } from 'express-cargo'

// 1. Define un objeto con campos virtuales y derivados de la solicitud
class OrderExample {
    @Body('price')
    price!: number

    @Body('quantity')
    quantity!: number

    // Campo calculado que no está presente en la solicitud
    @Virtual((obj: OrderExample) => obj.price * obj.quantity)
    total!: number
}

class HeaderExample {
    // Campo derivado directamente del objeto Request
    @Request(req => req.headers['x-custom-header'] as string)
    customHeader!: string
}

// 2. Configura la aplicación Express y la ruta
const app = express()
app.use(express.json())

app.post('/orders', bindingCargo(OrderExample), (req, res) => {
    const orderData = getCargo<OrderExample>(req)
    res.json({
        message: 'Datos del pedido procesados con campos virtuales!',
        data: orderData
    })
})

app.post('/headers', bindingCargo(HeaderExample), (req, res) => {
    const headerData = getCargo<HeaderExample>(req)
    res.json({
        message: 'Datos del encabezado asignados mediante @Request!',
        data: headerData
    })
})

/*
Para probar estos endpoints, envía solicitudes POST con el cuerpo o los encabezados correspondientes:

Cuerpo de ejemplo para /orders:
{
    "price": 50,
    "quantity": 2
}

Encabezados de ejemplo para /headers:
x-custom-header: my-header-value
*/
```
