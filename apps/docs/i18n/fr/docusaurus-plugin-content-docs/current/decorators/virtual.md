# Décorateurs de champs virtuels

**Express-Cargo** fournit des decorators pour définir des **champs virtuels** et des **champs dérivés de requête**. Ces decorators vous permettent de calculer des valeurs dynamiquement ou de mapper des données depuis la `Request` directement dans la propriété de l'objet.

## Decorators virtuels intégrés

### `@Virtual<T>(transformer: (obj: object) => T)`

Le decorator `@Virtual` définit une **propriété calculée** qui n'est pas directement sourcée depuis la requête. Au lieu de cela, sa valeur est dérivée d'autres propriétés de l'objet.

- **`transformer`** : Une fonction qui reçoit l'instance de l'objet et retourne la valeur calculée

### `@Request<T>(transformer: (req: Request) => T)`

Le decorator `@Request` mappe une valeur depuis l'objet Express `Request` dans une propriété de classe.

- **`transformer`** : Une fonction qui reçoit l'objet Request et retourne la valeur à lier.

`@Request` affecte la valeur retournée telle quelle, sans conversion de type intégrée. Un cas d'utilisation courant consiste à lier l'utilisateur qu'un middleware d'authentification, tel que Passport.js, a placé dans `req.user`.

## Exemple d'utilisation

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

    // Champ calculé non présent dans la requête
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
        message: 'Données de commande traitées avec des champs virtuels !',
        data: orderData,
    })
})

app.get('/passport', passport.authenticate('bearer', { session: false }), bindingCargo(PassportExample), (req, res) => {
    const cargo = getCargo<PassportExample>(req)
    res.json(cargo)
})
```

L'authentification Passport doit s'exécuter avant `bindingCargo()`. Lorsque l'authentification réussit, Passport définit `req.user` et `@Request<object>` lie cet objet à `PassportExample.user`. Passport rejette les identifiants absents ou non valides avant l'exécution du binding cargo.

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

L'utilisation de `object` rend l'exemple indépendant du modèle utilisateur de l'application. Si le code doit accéder à des propriétés telles que `user.id`, remplacez `object` par un type utilisateur concret et transmettez ce type à `@Request<T>`.
