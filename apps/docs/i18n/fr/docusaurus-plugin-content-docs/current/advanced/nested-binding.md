# Liaison d'objets imbriqués

Express-Cargo vous permet de gérer des objets imbriqués dans les requêtes, en les liant automatiquement à des objets imbriqués tout en supportant la conversion de type récursive et la validation.

## Exemple d'utilisation

```typescript
import express, { Request, Response } from 'express'
import { Body, bindingCargo, getCargo } from 'express-cargo'

// 1. Définir un objet imbriqué
class Profile {
    @Body('nickname')
    nickname!: string
}

class ExampleObject {
    @Body('profile')
    profile!: Profile
}

// 2. Configuration de l'application Express et de la route
const app = express()
app.use(express.json())

app.post('/submit', bindingCargo(ExampleObject), (req: Request, res: Response) => {
    const requestData = getCargo<ExampleObject>(req)

    res.json({
        message: 'Imbrication liée avec succès !',
        data: requestData,
    })
})

/*
Pour tester ce point de terminaison, envoyez une requête POST à /submit.

Exemple d'URL de requête :
http://localhost:3000/submit
*/
```

## Exemple de sortie

Lorsqu'une requête POST avec un objet profile imbriqué est envoyée, le middleware `bindingCargo` instancie et valide automatiquement l'`ExampleObject` imbriqué. La fonction `getCargo` retourne ensuite un objet entièrement peuplé avec les données imbriquées :

```json
{
    "message": "Imbrication liée avec succès !",
    "data": {
        "profile": {
            "nickname": "coder123"
        }
    }
}
```
