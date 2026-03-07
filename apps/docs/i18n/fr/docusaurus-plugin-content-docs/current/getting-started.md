---
id: getting-started
title: Premiers pas
---

## 🚀 Premiers pas avec express-cargo
Ce document fournit un guide de configuration minimale pour **découvrir rapidement express-cargo dans un environnement TypeScript + Express**.
Les exemples sont basés sur **pnpm + Node.js 18 ou version ultérieure**.

---

### 1. Prérequis

- Node.js **18 ou version ultérieure (LTS recommandée)**

Gestionnaire de paquets : npm | yarn | pnpm
→ Ce document utilise pnpm.

> Étant donné qu'express-cargo utilise des décorateurs et des métadonnées, TypeScript est recommandé.

---

### 2. Installation de Node.js
Installez la version LTS appropriée pour votre système d'exploitation à partir du site officiel ci-dessous.

- Téléchargement officiel de Node.js
    https://nodejs.org


Vérifiez l'installation :
```shell
node -v
pnpm -v
```
Si l'installation est réussie, la version s'affichera.

---

### 3. Créer un nouveau projet (pnpm)
#### pnpm
```shell
mkdir express-cargo-example
cd express-cargo-example
pnpm init
```

### 4. Configurer l'environnement TypeScript
#### 4-1. Installer TypeScript et les dépendances de développement
```shell
pnpm add -D typescript ts-node @types/node
```

#### 4-2. Créer le fichier tsconfig.json
```shell
pnpm tsc --init
```
#### 4-3. Paramètres tsconfig recommandés
```json
{
  "compilerOptions": {
    ...,
    "experimentalDecorators": true,     // requis pour express-cargo
    "emitDecoratorMetadata": true,      // utiliser les métadonnées de type
    ...
  },
  ...
}
```

>⚠️ Sans `experimentalDecorators` und `emitDecoratorMetadata`, la validation et la transformation dans express-cargo ne fonctionneront pas.

---

### 5. Installer express & express-cargo
```shell
pnpm add express express-cargo
pnpm add -D @types/express
pnpm add reflect-metadata
```

---

### 6. Serveur de base + configuration express-cargo
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

app.listen(port, () => {console.log(`Exemple d'application écoutant sur le port ${port}`)})

class ExampleRequest {
  @Body() // Extraire les champs du corps de la requête
  @Equal('1') // Si la valeur n'est pas "1", une erreur de validation se produit
  id!: string
}

app.post('/example', bindingCargo(ExampleRequest), (req, res) => { // bindingCargo(Class) : Conversion Requête → DTO + validation
  const cargo = getCargo<ExampleRequest>(req) // Retourne un objet typé et validé
  res.json(cargo)
})
```

### 7. Exécution
```shell
npm run dev
```
test de requête :

```
POST http://localhost:3000/example
Content-Type: application/json

{
  "id": "1"
}

```

réponse :

```
{ "id": "1" }
```

- ❌ `"id": "2"` → Une erreur de validation se produit
