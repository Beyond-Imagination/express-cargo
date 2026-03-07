# Décorateurs de champs virtuels

**Express-Cargo** fournit des decorators pour définir des **champs virtuels** et des **champs dérivés de requête**. Ces decorators vous permettent de calculer des valeurs dynamiquement ou de mapper des données depuis la `Request` directement dans la propriété de l'objet.

## Decorators virtuels intégrés

### `@Virtual<T>(transformer: (obj: object) => T)`

Le decorator `@Virtual` définit une **propriété calculée** qui n'est pas directement sourcée depuis la requête. Au lieu de cela, sa valeur est dérivée d'autres propriétés de l'objet.

- **`transformer`** : Une fonction qui reçoit l'instance de l'objet et retourne la valeur calculée

### `@Request<T>(transformer: (req: Request) => T)`

Le decorator `@Request` mappe une valeur depuis l'objet Express `Request` dans une propriété de classe.

- **`transformer`** : Une fonction qui reçoit l'objet Request et retourne la valeur à lier.

## Exemple d'utilisation

```typescript
import express from 'express'
import { Body, Virtual, Request, bindingCargo, getCargo } from 'express-cargo'

// 1. Définir l'objet avec des champs virtuels et dérivés de requête
class OrderExample {
    @Body('price')
    price!: number

    @Body('quantity')
    quantity!: number

    // Champ calculé non présent dans la requête
    @Virtual((obj: OrderExample) => obj.price * obj.quantity)
    total!: number
}

class HeaderExample {
    // Champ dérivé directement de l'objet requête
    @Request(req => req.headers['x-custom-header'] as string)
    customHeader!: string
}

// 2. Configuration de l'application Express et de la route
const app = express()
app.use(express.json())

app.post('/orders', bindingCargo(OrderExample), (req, res) => {
    const orderData = getCargo<OrderExample>(req)
    res.json({
        message: 'Données de commande traitées avec des champs virtuels !',
        data: orderData
    })
})

app.post('/headers', bindingCargo(HeaderExample), (req, res) => {
    const headerData = getCargo<HeaderExample>(req)
    res.json({
        message: 'Données d\'en-tête mappées en utilisant @request !',
        data: headerData
    })
})

/*
Pour tester ces points de terminaison, envoyez des requêtes POST avec le corps ou les en-têtes pertinents :

Exemple de corps /orders :
{
    "price": 50,
    "quantity": 2
}

Exemple d'en-têtes /headers :
x-custom-header: ma-valeur-d-en-tete
*/
```
