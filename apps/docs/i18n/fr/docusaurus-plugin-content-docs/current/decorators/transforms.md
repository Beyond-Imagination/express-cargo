# Décorateur de transformation

Express-Cargo fournit un décorateur pour transformer automatiquement les données de requête entrantes avant de les lier à une classe. Cela est utile pour des tâches telles que la normalisation des entrées utilisateur (par exemple, convertir une chaîne en minuscules) ou l'analyse d'une chaîne séparée par des virgules en un tableau.

Contrairement aux champs virtuels, qui combinent des champs existants pour en créer un nouveau, ce décorateur de transformation modifie directement la valeur d'un seul champ.

## `@Transform<T>(transformer: (value: T) => T)`

C'est le décorateur principal pour la transformation des données. Il prend une fonction transformer qui reçoit la valeur brute de la requête et retourne la nouvelle valeur transformée pour le champ.

- `transformer` : Une fonction qui accepte la valeur brute et retourne la valeur transformée.

## Exemple d'utilisation

Cet exemple montre comment le décorateur `@Transform` peut être utilisé pour normaliser et traiter les données de requête dans un format désiré. Ceci est très utile pour gérer diverses entrées utilisateur et s'assurer que votre API les traite de manière cohérente, ce qui améliore la stabilité de votre application.

```typescript
import express, { Request, Response } from 'express'
import { bindingCargo, getCargo, Query, Transform } from 'express-cargo'

// 1. Définir une classe avec des règles de traitement et de normalisation des données
class SearchRequest {
    // Transforme le paramètre de requête 'sortBy' en minuscules pour un tri cohérent
    @Query()
    @Transform((value: string) => value.toLowerCase())
    sortBy!: string

    // Double la valeur du paramètre de requête 'count'
    @Query()
    @Transform((value: number) => value * 2)
    count!: number
}

const app = express()
app.use(express.json())

// 2. Appliquer le middleware bindingCargo à la route
app.get('/search', bindingCargo(SearchRequest), (req: Request, res: Response) => {
    // 3. Accéder aux données transformées avec les types corrects
    const searchParams = getCargo<SearchRequest>(req)

    res.json({
        message: 'Paramètres de recherche transformés avec succès !',
        data: searchParams,
        // Vérifier le type des données transformées
        sortByType: typeof searchParams.sortBy,
        countType: typeof searchParams.count,
    })
})

/*
Pour tester ce point de terminaison, envoyez une requête GET à /search.

Exemple d'URL de requête :
http://localhost:3000/search?sortBy=TITLE&count=10
*/
```

## Exemple de sortie

Lorsque l'URL de requête d'exemple est accédée, le middleware `bindingCargo` traite les paramètres de requête. Les décorateurs `@Transform` normalisent ensuite la valeur `sortBy` en une chaîne en minuscules et doublent la valeur `count`. La fonction `getCargo` retourne un objet avec ces valeurs transformées.

```json
{
    "message": "Paramètres de recherche transformés avec succès !",
    "data": {
        "sortBy": "title",
        "count": 20
    },
    "sortByType": "string",
    "countType": "number"
}
```
