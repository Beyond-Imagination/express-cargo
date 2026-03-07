---
id: getting-started
title: Erste Schritte
---

## 🚀 Erste Schritte mit express-cargo
Dieses Dokument bietet eine Anleitung zur Minimalkonfiguration, um **express-cargo schnell in einer TypeScript + Express-Umgebung auszuprobieren**.
Die Beispiele basieren auf **pnpm + Node.js 18 oder neuer**.

---

### 1. Voraussetzungen

- Node.js **18 oder neuer (LTS empfohlen)**

Paketmanager: npm | yarn | pnpm
→ In diesem Dokument wird pnpm verwendet.

> Da express-cargo Decorators + Metadaten verwendet, wird TypeScript empfohlen.

---

### 2. Installieren von Node.js
Installieren Sie die für Ihr Betriebssystem passende LTS-Version von der unten angegebenen offiziellen Website.

- Offizieller Node.js-Download
    https://nodejs.org


Installation überprüfen:
```shell
node -v
pnpm -v
```
Bei Erfolg wird die Version angezeigt.

---

### 3. Neues Projekt erstellen (pnpm)
#### pnpm
```shell
mkdir express-cargo-example
cd express-cargo-example
pnpm init
```

### 4. TypeScript-Umgebung einrichten
#### 4-1. TypeScript und Entwicklungsabhängigkeiten installieren
```shell
pnpm add -D typescript ts-node @types/node
```

#### 4-2. tsconfig.json erstellen
```shell
pnpm tsc --init
```
#### 4-3. Empfohlene tsconfig-Einstellungen
```json
{
  "compilerOptions": {
    ...,
    "experimentalDecorators": true,     // für express-cargo erforderlich
    "emitDecoratorMetadata": true,      // Typmetadaten verwenden
    ...
  },
  ...
}
```

>⚠️ Ohne `experimentalDecorators` und `emitDecoratorMetadata` funktioniert die Validierung/Transformation in express-cargo nicht.

---

### 5. express & express-cargo installieren
```shell
pnpm add express express-cargo
pnpm add -D @types/express
pnpm add reflect-metadata
```

---

### 6. Basisserver + express-cargo-Einstellungen
#### 6-1. `src/app.ts`

```typescript
import express from 'express'
import { bindingCargo, getCargo, Body, Query, Header, Params, Min, Max, Equal, NotEqual, Prefix, Suffix } from 'express-cargo'
import errorHandlerRouter from './errorHandler'

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(errorHandlerRouter)

app.listen(port, () => {console.log(`Beispiel-App hört auf Port ${port}`)})

class ExampleRequest {
  @Body() // Felder aus dem Request-Body extrahieren
  @Equal('1') // Wenn der Wert nicht "1" ist, tritt ein Validierungsfehler auf
  id!: string
}

app.post('/example', bindingCargo(ExampleRequest), (req, res) => { // bindingCargo(Class): Request → DTO-Konvertierung + Validierung
  const cargo = getCargo<ExampleRequest>(req) // Gibt ein validiertes, typsicheres Objekt zurück
  res.json(cargo)
})
```

### 7. Ausführen
```shell
npm run dev
```
Test-Anfrage:

```
POST http://localhost:3000/example
Content-Type: application/json

{
  "id": "1"
}

```

Antwort:

```
{ "id": "1" }
```

- ❌ `"id": "2"` → Validierungsfehler tritt auf
