# Verschachtelte Objektbindung

Express-Cargo ermöglicht die Handhabung von verschachtelten Objekten in Anfragen, indem es sie automatisch an verschachtelte Objekte bindet und dabei rekursives Type-Casting und Validierung unterstützt.

## Anwendungsbeispiel

```typescript
import express, { Request, Response } from 'express'
import { Body, bindingCargo, getCargo } from 'express-cargo'

// 1. Verschachteltes Objekt definieren
class Profile {
    @Body('nickname')
    nickname!: string
}

class ExampleObject {
    @Body('profile')
    profile!: Profile
}

// 2. Express-App und Route einrichten
const app = express()
app.use(express.json())

app.post('/submit', bindingCargo(ExampleObject), (req: Request, res: Response) => {
    const requestData = getCargo<ExampleObject>(req)

    res.json({
        message: 'Verschachtelte Bindung erfolgreich!',
        data: requestData,
    })
})

/*
Um diesen Endpunkt zu testen, senden Sie eine POST-Anfrage an /submit.

Beispiel-Anfrage-URL:
http://localhost:3000/submit
*/
```

## Ausgabebeispiel

Wenn eine POST-Anfrage mit einem verschachtelten Profilobjekt gesendet wird, instanziiert und validiert die `bindingCargo`-Middleware automatisch das verschachtelte `ExampleObject`. Die `getCargo`-Funktion gibt dann ein vollständig gefülltes Objekt mit den verschachtelten Daten zurück:

```json
{
    "message": "Verschachtelte Bindung erfolgreich!",
    "data": {
        "profile": {
            "nickname": "coder123"
        }
    }
}
```
