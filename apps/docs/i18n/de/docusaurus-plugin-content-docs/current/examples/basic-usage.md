# Grundlegende Verwendung

Dieses Beispiel zeigt den einfachsten End-to-End-Ablauf von **express-cargo**: eine Request-Klasse definieren, sie mit der `bindingCargo`-Middleware binden und das validierte Ergebnis mit `getCargo` lesen.

> Diese Seite konzentriert sich nur auf den Binding-Ablauf. Für die Projekteinrichtung (TypeScript, `tsconfig`, Installation der Abhängigkeiten) siehe [Erste Schritte](../getting-started.md).

## 1. Eine Request-Klasse definieren

Deklarieren Sie eine Klasse und verwenden Sie einen Source-Decorator (hier `@Body()`), um jedes Feld einem Teil der eingehenden Anfrage zuzuordnen.

```typescript
// create-user.request.ts
import { Body } from 'express-cargo'

export class CreateUserRequest {
    @Body('name')
    name!: string

    @Body('email')
    email!: string
}
```

## 2. Die Middleware anwenden

Übergeben Sie die Request-Klasse an `bindingCargo` und registrieren Sie sie als Middleware auf der Route. Die Middleware bindet und validiert die Anfrage, bevor Ihr Handler ausgeführt wird.

```typescript
import express from 'express'
import { bindingCargo, getCargo } from 'express-cargo'
import { CreateUserRequest } from './create-user.request'

const app = express()
app.use(express.json())

app.post('/users', bindingCargo(CreateUserRequest), (req, res) => {
    // 3. Das gebundene, typsichere Objekt lesen
    const user = getCargo<CreateUserRequest>(req)

    res.json({
        message: 'User created!',
        data: user,
    })
})
```

## 3. Beispielanfrage

```json
{
    "name": "Jane Doe",
    "email": "jane@example.com"
}
```

## 4. Beispielergebnis

`getCargo<CreateUserRequest>(req)` gibt eine vollständig gefüllte Instanz von `CreateUserRequest` zurück:

```json
{
    "message": "User created!",
    "data": {
        "name": "Jane Doe",
        "email": "jane@example.com"
    }
}
```

## Nächste Schritte

- Daten aus anderen Quellen abrufen (`@Query`, `@Header`, `@Params`) — siehe [Source-Decorators](../decorators/source-decorators.md)
- Validierungsregeln wie `@Min`, `@Email` hinzufügen — siehe [Validierungs-Decorators](../decorators/validators.md)
- Verschachtelte Objekte binden — siehe [Umgang mit verschachtelten Anfragen](./nested-request.md)
- Validierungsfehler behandeln — siehe [Fehlerbehandlung](./validation-errors.md)
