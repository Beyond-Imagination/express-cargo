# Transformations-Decorator

Express-Cargo bietet einen Decorator, um eingehende Anfragedaten automatisch zu transformieren, bevor sie an eine Klasse gebunden werden. Dies ist nützlich für Aufgaben wie die Normalisierung von Benutzereingaben (z. B. Umwandlung eines Strings in Kleinbuchstaben) oder das Parsen eines kommagetrennten Strings in ein Array.

Im Gegensatz zu virtuellen Feldern, die vorhandene Felder kombinieren, um ein neues zu erstellen, ändert dieser Transformations-Decorator direkt den Wert eines einzelnen Felds.

## `@Transform<T>(transformer: (value: T) => T)`

Dies ist der primäre Decorator für die Datentransformation. Er nimmt eine Transformer-Funktion entgegen, die den Rohwert aus der Anfrage empfängt und den neuen, transformierten Wert für das Feld zurückgibt.

- `transformer`: Eine Funktion, die den Rohwert akzeptiert und den transformierten Wert zurückgibt.

## Anwendungsbeispiel

Dieses Beispiel zeigt, wie der `@Transform`-Decorator verwendet werden kann, um Anfragedaten zu normalisieren und in ein gewünschtes Format zu verarbeiten. Dies ist äußerst nützlich, um verschiedene Benutzereingaben zu handhaben und sicherzustellen, dass Ihre API sie konsistent verarbeitet, was die Stabilität Ihrer Anwendung verbessert.

```typescript
import express, { Request, Response } from 'express'
import { bindingCargo, getCargo, Query, Transform } from 'express-cargo'

// 1. Definieren Sie eine Klasse mit Datenverarbeitungs- und Normalisierungsregeln
class SearchRequest {
    // Transformiert den 'sortBy'-Query-Parameter in Kleinbuchstaben für konsistente Sortierung
    @Query()
    @Transform((value: string) => value.toLowerCase())
    sortBy!: string

    // Verdoppelt den Wert des 'count'-Query-Parameters
    @Query()
    @Transform((value: number) => value * 2)
    count!: number
}

const app = express()
app.use(express.json())

// 2. Wenden Sie die bindingCargo-Middleware auf die Route an
app.get('/search', bindingCargo(SearchRequest), (req: Request, res: Response) => {
    // 3. Greifen Sie mit den korrekten Typen auf die transformierten Daten zu
    const searchParams = getCargo<SearchRequest>(req)

    res.json({
        message: 'Suchparameter erfolgreich transformiert!',
        data: searchParams,
        // Überprüfen Sie den Typ der transformierten Daten
        sortByType: typeof searchParams.sortBy,
        countType: typeof searchParams.count,
    })
})

/*
Um diesen Endpunkt zu testen, senden Sie eine GET-Anfrage an /search.

Beispiel-Anfrage-URL:
http://localhost:3000/search?sortBy=TITLE&count=10
*/
```

## Ausgabebeispiel

Wenn auf die Beispiel-Anfrage-URL zugegriffen wird, verarbeitet die `bindingCargo`-Middleware die Query-Parameter. Die `@Transform`-Decorators normalisieren dann den `sortBy`-Wert in einen Kleinbuchstaben-String und verdoppeln den `count`-Wert. Die `getCargo`-Funktion gibt ein Objekt mit diesen transformierten Werten zurück.

```json
{
    "message": "Suchparameter erfolgreich transformiert!", 
    "data": {
        "sortBy": "title",
        "count": 20
    },
    "sortByType": "string",
    "countType": "number"
}
```
