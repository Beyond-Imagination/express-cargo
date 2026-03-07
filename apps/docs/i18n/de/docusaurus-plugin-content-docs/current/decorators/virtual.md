# Virtuelle Feld-Decorators

**Express-Cargo** bietet Decorators zur Definition von **virtuellen Feldern** und **anfragebasierten Feldern**. Diese Decorators ermöglichen es Ihnen, Werte dynamisch zu berechnen oder Daten aus dem `Request`-Objekt direkt in die Objekteigenschaft abzubilden.

## Integrierte virtuelle Decorators

### `@Virtual<T>(transformer: (obj: object) => T)`

Der `@Virtual`-Decorator definiert eine **berechnete Eigenschaft**, die nicht direkt aus der Anfrage stammt. Stattdessen wird ihr Wert aus anderen Eigenschaften des Objekts abgeleitet.

- **`transformer`**: Eine Funktion, die die Objektinstanz empfängt und den berechneten Wert zurückgibt.

### `@Request<T>(transformer: (req: Request) => T)`

Der `@Request`-Decorator bildet einen Wert aus dem Express `Request`-Objekt in eine Klasseneigenschaft ab.

- **`transformer`**: Eine Funktion, die das Request-Objekt empfängt und den zu bindenden Wert zurückgibt.

## Anwendungsbeispiel

```typescript
import express from 'express'
import { Body, Virtual, Request, bindingCargo, getCargo } from 'express-cargo'

// 1. Definieren Sie ein Objekt mit virtuellen und anfragebasierten Feldern
class OrderExample {
    @Body('price')
    price!: number

    @Body('quantity')
    quantity!: number

    // Berechnetes Feld, das nicht in der Anfrage vorhanden ist
    @Virtual((obj: OrderExample) => obj.price * obj.quantity)
    total!: number
}

class HeaderExample {
    // Feld, das direkt vom Request-Objekt abgeleitet wird
    @Request(req => req.headers['x-custom-header'] as string)
    customHeader!: string
}

// 2. Express-App und Route einrichten
const app = express()
app.use(express.json())

app.post('/orders', bindingCargo(OrderExample), (req, res) => {
    const orderData = getCargo<OrderExample>(req)
    res.json({
        message: 'Bestelldaten mit virtuellen Feldern verarbeitet!',
        data: orderData
    })
})

app.post('/headers', bindingCargo(HeaderExample), (req, res) => {
    const headerData = getCargo<HeaderExample>(req)
    res.json({
        message: 'Header-Daten mit @request abgebildet!',
        data: headerData
    })
})

/*
Um diese Endpunkte zu testen, senden Sie POST-Anfragen mit dem entsprechenden Body oder den Headern:

Beispiel /orders Body:
{
    "price": 50,
    "quantity": 2
}

Beispiel /headers Header:
x-custom-header: my-header-value
*/
```
