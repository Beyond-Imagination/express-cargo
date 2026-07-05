# Utilisation de base

Cet exemple montre le flux de bout en bout le plus simple d'**express-cargo** : définir une classe de requête, la lier avec le middleware `bindingCargo` et lire le résultat validé avec `getCargo`.

> Cette page se concentre uniquement sur le flux de liaison. Pour la configuration du projet (TypeScript, `tsconfig`, installation des dépendances), voir [Premiers pas](../getting-started.md).

## 1. Définir une classe de requête

Déclarez une classe et utilisez un décorateur de source (ici `@Body()`) pour mapper chaque champ à une partie de la requête entrante.

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

## 2. Appliquer le middleware

Passez la classe de requête à `bindingCargo` et enregistrez-le comme middleware sur la route. Le middleware lie et valide la requête avant l'exécution de votre gestionnaire.

```typescript
import express from 'express'
import { bindingCargo, getCargo } from 'express-cargo'
import { CreateUserRequest } from './create-user.request'

const app = express()
app.use(express.json())

app.post('/users', bindingCargo(CreateUserRequest), (req, res) => {
    // 3. Lire l'objet lié et typé
    const user = getCargo<CreateUserRequest>(req)

    res.json({
        message: 'User created!',
        data: user,
    })
})
```

## 3. Exemple de requête

```json
{
    "name": "Jane Doe",
    "email": "jane@example.com"
}
```

## 4. Exemple de résultat

`getCargo<CreateUserRequest>(req)` retourne une instance entièrement remplie de `CreateUserRequest` :

```json
{
    "message": "User created!",
    "data": {
        "name": "Jane Doe",
        "email": "jane@example.com"
    }
}
```

## Étapes suivantes

- Récupérer des données depuis d'autres sources (`@Query`, `@Header`, `@Params`) — voir [Décorateurs de source](../decorators/source-decorators.md)
- Ajouter des règles de validation comme `@Min`, `@Email` — voir [Décorateurs de validation](../decorators/validators.md)
- Lier des objets imbriqués — voir [Gestion des requêtes imbriquées](./nested-request.md)
- Gérer les échecs de validation — voir [Gestion des erreurs](./validation-errors.md)
