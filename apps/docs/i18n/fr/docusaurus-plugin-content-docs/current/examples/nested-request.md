# Gestion des requêtes imbriquées

Cet exemple montre comment **Express-Cargo** peut remplir des requêtes imbriquées, vous permettant de mapper des données de requête complexes et structurées en un seul objet bien organisé.

## 1. Définir vos requêtes

Dans ce scénario, nous allons définir deux classes : `UserInfoRequest` et `OrderRequest`. La classe `UserInfoRequest` extrait les détails de l'utilisateur du corps de la requête et un jeton d'authentification des en-têtes.

**`UserInfoRequest`** – Mappe les détails de l'utilisateur depuis le corps de la requête et extrait le jeton d'autorisation des en-têtes.

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

    // Extraire le jeton de l'en-tête Authorization.
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

**`OrderRequest`** – Représente une requête de commande, incluant une `UserInfoRequest` imbriquée.

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

Dans `UserInfoRequest`, nous utilisons le decorator `@header` sur la propriété `authorization` pour obtenir la valeur de l'en-tête `Authorization`. Ensuite, le decorator `@transform` extrait juste la valeur du jeton, en supprimant le préfixe `"Bearer "`.

## 2. Utiliser dans une route Express

Appliquez simplement le middleware `bindingCargo` à votre route avec la requête de niveau supérieur, `OrderRequest`. Le middleware gérera toute la logique de liaison pour vous.

```typescript
router.post('/orders', bindingCargo(OrderRequest), (req, res) => {
    const order = getCargo<OrderRequest>(req)

    if (order) {
        console.log(`Traitement de la commande pour le produit : ${order.productId}`)
        console.log(`Nom de l'utilisateur : ${order.user.name}`)
        console.log(`Jeton d'authentification : ${order.user.authorization}`)

        // Vous pouvez maintenant utiliser le jeton d'authentification pour la validation ou d'autres logiques.
        res.json({ message: 'Commande reçue', order })
    }
})
```

## 3. Exemple de requête

Cette route traitera avec succès une requête qui a à la fois un corps et un en-tête `Authorization`.

- Corps de la requête :
    ```json
    {
        "productId": "SKU-456",
        "quantity": 5,
        "user": {
            "name": "Jeanne Dupont",
            "email": "user-jeanne@example.com"
        }
    }
    ```

- En-têtes de la requête :

    ```
    Authorization: Bearer mon-jeton-auth-12345
    ```

Lors du traitement, `getCargo(req)` retournera un seul objet `OrderRequest` qui contient toutes les données, avec la propriété `authorization` correctement remplie depuis l'en-tête. Cela démontre comment **Express-Cargo** unifie élégamment plusieurs sources de données en un seul objet propre.

## 4. Exemple de résultat

Objet `OrderRequest` lié final :

```json
{
    "productId": "SKU-456",
    "quantity": 5,
    "user": {
        "name": "Jeanne Dupont",
        "email": "user-jeanne@example.com",
        "authorization": "mon-jeton-auth-12345"
    }
}
```
