# Virtuelle Feld-Decorators

**Express-Cargo** bietet Decorators zur Definition von **virtuellen Feldern** und **anfragebasierten Feldern**. Diese Decorators ermöglichen es Ihnen, Werte dynamisch zu berechnen oder Daten aus dem `Request`-Objekt direkt in die Objekteigenschaft abzubilden.

## Integrierte virtuelle Decorators

### `@Virtual<T>(transformer: (obj: object) => T)`

Der `@Virtual`-Decorator definiert eine **berechnete Eigenschaft**, die nicht direkt aus der Anfrage stammt. Stattdessen wird ihr Wert aus anderen Eigenschaften des Objekts abgeleitet.

- **`transformer`**: Eine Funktion, die die Objektinstanz empfängt und den berechneten Wert zurückgibt.

### `@Request<T>(transformer: (req: Request) => T)`

Der `@Request`-Decorator bildet einen Wert aus dem Express `Request`-Objekt in eine Klasseneigenschaft ab.

- **`transformer`**: Eine Funktion, die das Request-Objekt empfängt und den zu bindenden Wert zurückgibt.

`@Request` weist den zurückgegebenen Wert unverändert und ohne integrierte Typumwandlung zu. Ein typischer Anwendungsfall ist das Binden eines Benutzers, den eine Authentifizierungs-Middleware wie Passport.js auf `req.user` gesetzt hat.

## Die Wahl zwischen beiden

`@Virtual` und `@Request` gehören zu zwei verschiedenen Kategorien, und ein Feld nimmt genau eine davon. Beide zusammen führen bei der Registrierung der Route zu `@Request cannot be combined with @Virtual`, und die Kombination des einen oder anderen mit einem Source-Decorator wie `@Body` wird genauso abgelehnt – alle drei beantworten dieselbe Frage, woher der Wert eines Feldes stammt.

- Greifen Sie zu `@Request`, wenn der Wert am rohen `Request`-Objekt liegt, bevor die eigenen Felder des Objekts gebunden werden.
- Greifen Sie zu `@Virtual`, wenn der Wert aus anderen Feldern des aufgebauten Objekts abgeleitet wird.

`@Virtual` läuft, nachdem alle Source-Felder gebunden wurden, und kann diese Felder daher unabhängig von ihrer Deklarationsreihenfolge lesen. Nur ein `@Virtual`-Feld, das von einem anderen `@Virtual`-Feld abhängt, ist reihenfolgeabhängig.

## Anwendungsbeispiel

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

    // Berechnetes Feld, das nicht in der Anfrage vorhanden ist
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
        message: 'Bestelldaten mit virtuellen Feldern verarbeitet!',
        data: orderData,
    })
})

app.get('/passport', passport.authenticate('bearer', { session: false }), bindingCargo(PassportExample), (req, res) => {
    const cargo = getCargo<PassportExample>(req)
    res.json(cargo)
})
```

Die Passport-Authentifizierung muss vor `bindingCargo()` ausgeführt werden. Nach erfolgreicher Authentifizierung setzt Passport `req.user`, und `@Request<object>` bindet dieses Objekt an `PassportExample.user`. Fehlende oder ungültige Anmeldedaten werden von Passport abgelehnt, bevor das Cargo-Binding ausgeführt wird.

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

Mit `object` bleibt das Beispiel unabhängig vom Benutzermodell der Anwendung. Wenn der Anwendungscode auf Eigenschaften wie `user.id` zugreifen muss, ersetzen Sie `object` durch einen konkreten Benutzertyp und übergeben Sie diesen Typ an `@Request<T>`.
