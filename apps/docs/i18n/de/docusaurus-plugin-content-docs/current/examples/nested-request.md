# Behandlung von verschachtelten Anfragen

Dieses Beispiel zeigt, wie **Express-Cargo** verschachtelte Anfragen füllen kann, sodass Sie komplexe, strukturierte Anfragedaten in einem einzigen, gut organisierten Objekt abbilden können.

## 1. Definieren Sie Ihre Anfragen

In diesem Szenario definieren wir zwei Klassen: `UserInfoRequest` und `OrderRequest`. Die `UserInfoRequest`-Klasse ruft Benutzerdetails aus dem Anfrage-Body und ein Authentifizierungstoken aus den Headern ab.

**`UserInfoRequest`** – Mappt Benutzerdetails aus dem Anfrage-Body und extrahiert das Autorisierungstoken aus den Headern.

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

    // Extrahiert das Token aus dem Authorization-Header.
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

**`OrderRequest`** – Repräsentiert eine Bestellanfrage, einschließlich einer verschachtelten `UserInfoRequest`.

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

In `UserInfoRequest` verwenden wir den `@header`-Decorator für die `authorization`-Eigenschaft, um den Wert aus dem `Authorization`-Header zu erhalten. Dann extrahiert der `@transform`-Decorator nur den Token-Wert und entfernt das Präfix `"Bearer "`.

## 2. Verwendung in einer Express-Route

Wenden Sie einfach die `bindingCargo`-Middleware auf Ihre Route mit der übergeordneten Anfrage, `OrderRequest`, an. Die Middleware übernimmt die gesamte Bindungslogik für Sie.

```typescript
router.post('/orders', bindingCargo(OrderRequest), (req, res) => {
    const order = getCargo<OrderRequest>(req)

    if (order) {
        console.log(`Verarbeite Bestellung für Produkt: ${order.productId}`)
        console.log(`Benutzername: ${order.user.name}`)
        console.log(`Auth-Token: ${order.user.authorization}`)

        // Sie können das Auth-Token jetzt für die Validierung oder andere Logik verwenden.
        res.json({ message: 'Bestellung erhalten', order })
    }
})
```

## 3. Beispielanfrage

Diese Route verarbeitet erfolgreich eine Anfrage, die sowohl einen Body als auch einen `Authorization`-Header hat.

- Anfrage-Body:
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

- Anfrage-Header:

    ```
    Authorization: Bearer my-auth-token-12345
    ```

Bei der Verarbeitung gibt `getCargo(req)` ein einzelnes `OrderRequest`-Objekt zurück, das alle Daten enthält, wobei die `authorization`-Eigenschaft korrekt aus dem Header gefüllt ist. Dies zeigt, wie **Express-Cargo** elegant mehrere Datenquellen in einem sauberen Objekt vereint.

## 4. Beispielergebnis

Final gebundenes `OrderRequest`-Objekt:

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
