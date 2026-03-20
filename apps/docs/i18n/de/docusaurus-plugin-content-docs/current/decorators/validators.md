# Validierungs-Decorators

Express-Cargo verwendet Decorators, um eingehende Anfragedaten zu validieren, die an eine Klasse gebunden sind.

Die Validierung wird nicht durch eine eigenständige `validate`-Funktion durchgeführt. Stattdessen ist sie in die `bindingCargo`-Middleware integriert, die Daten während des Anfragelebenszyklus automatisch validiert.

## Integrierte Validatoren

### `@Optional()`

Markiert ein Feld als optional, sodass es weggelassen oder auf `undefined` gesetzt werden kann, ohne Validierungsfehler auszulösen.

### `@Min(value: number)`

Validiert, dass eine Zahl größer oder gleich dem angegebenen Mindestwert ist.

- **`value`**: Der zulässige Mindestwert.

### `@Max(value: number)`

Validiert, dass eine Zahl kleiner oder gleich dem angegebenen Höchstwert ist.

- **`value`**: Der zulässige Höchstwert.

### `@Range(min: number, max: number)`

Validiert, dass eine Zahl innerhalb des angegebenen Bereichs liegt, einschließlich der Mindest- und Höchstwerte.

- **`min`**: Der zulässige Mindestwert.
- **`max`**: Der zulässige Höchstwert.

### `@Prefix(value: string)`

Validiert, dass ein String mit dem angegebenen Präfix beginnt.

- **`value`**: Der erforderliche Anfangstext.

### `@Suffix(value: string)`

Validiert, dass ein String mit dem angegebenen Suffix endet.

- **`value`**: Der erforderliche Endtext.

### `@Equal(value: any)`

Validiert, dass ein Wert strikt gleich (`===`) dem angegebenen Wert ist.

- **`value`**: Der Wert, mit dem verglichen werden soll.

### `@NotEqual(value: any)`

Validiert, dass ein Wert strikt ungleich (`!==`) dem angegebenen Wert ist.

- **`value`**: Der Wert, mit dem verglichen werden soll.

### `@IsTrue()`

Validiert, dass die dekorierte Eigenschaft wahr (true) ist.

### `@IsFalse()`

Validiert, dass die dekorierte Eigenschaft falsch (false) ist.

### `@Length(value: number)`

Validiert, dass die Länge des dekorierten Strings genau dem angegebenen Wert entspricht.

- **`value`**: Die erforderliche genaue Länge in Zeichen.

### `@MaxLength(value: number)`

Validiert, dass die Länge des dekorierten Strings das angegebene Maximum nicht überschreitet.

- **`value`**: Die maximal zulässige Länge in Zeichen.

### `@MinLength(value: number)`

Validiert, dass die Länge des dekorierten Strings mindestens dem angegebenen Minimum entspricht.

- **`value`**: Die minimal zulässige Länge in Zeichen.

### `@OneOf(values: any[])`

Validiert, dass der Eingabewert einer der angegebenen Werte ist.

- **`values`**: Das Array der zulässigen Werte.

### `@ListContains(values: any[], comparator?: (expected, actual) => boolean, message?: string)`

Überprüft, ob das Array alle angegebenen Werte enthält. Unterstützt primitive Werte, Objekte, Date und gemischte Typen.

- **`values`**: Die Werte, die im Array vorhanden sein müssen.
- **`comparator`** (optional): Eine benutzerdefinierte Vergleichsfunktion `(expected, actual) => boolean`. Wenn angegeben, werden alle Vergleiche an diese Funktion delegiert, einschließlich primitiver Werte.
- **`message`** (optional): Die Fehlermeldung, die bei fehlgeschlagener Validierung angezeigt wird. Wenn weggelassen, wird eine Standardmeldung verwendet.

> **Warnung**: Der Objektvergleich verwendet standardmäßig tiefe Gleichheit. Die Leistung kann beeinträchtigt werden, wenn `values` viele Objekte oder tief verschachtelte Strukturen enthält. Erwägen Sie die Verwendung eines `comparator` für einen effizienteren oder flexibleren Vergleich.

### `@Enum(enumObj: object, message?: string)`

Validiert, dass der Eingabewert mit einem der Werte im angegebenen Enum-Objekt übereinstimmt.
Es transformiert auch automatisch den Eingabewert (z. B. einen Zeichenkettenschlüssel) in den entsprechenden Enum-Wert.

- **`enumObj`**: Das Enum-Objekt, gegen das validiert werden soll.
- **`message`** (optional): Die Fehlermeldung, die angezeigt wird, wenn die Validierung fehlschlägt. Wenn weggelassen, wird eine Standardmeldung verwendet.

### `@Validate(validateFn: (value: unknown) => boolean, message?: string)`

Validiert einen Wert mithilfe einer benutzerdefinierten Validierungsfunktion.
Dieser Decorator bietet Flexibilität, um Validierungslogik über die integrierten hinaus zu implementieren.

- **`validateFn`**: Eine Funktion, die den Feldwert empfängt und true zurückgibt, wenn er gültig ist, andernfalls false.
- **`message`** (optional): Die Fehlermeldung, die angezeigt wird, wenn die Validierung fehlschlägt. Wenn weggelassen, wird eine Standardmeldung verwendet.

### `@Regexp(pattern: RegExp, message?: string)`

Validiert, dass das dekorierte Feld dem angegebenen regulären Ausdrucksmuster entspricht.
Dieser Decorator ist nützlich, um Formatregeln wie E-Mail, Telefonnummern usw. durchzusetzen.

- **`pattern`**: Ein RegExp-Objekt, das zum Testen des Feldwerts verwendet wird. Der Wert ist gültig, wenn er dem Muster entspricht.
- **`message`** (optional): Die Fehlermeldung, die angezeigt wird, wenn die Validierung fehlschlägt. Wenn weggelassen, wird eine Standardmeldung verwendet.

### `@Email()`

Validiert, dass die dekorierte Eigenschaft eine gültige E-Mail-Adresse ist.

### `@Alpha(message?: string)`

Validiert, dass das dekorierte Feld nur alphabetische Zeichen enthält (Groß- oder Kleinbuchstaben, A–Z / a–z).

- **`message`** (optional): Die Fehlermeldung, die angezeigt wird, wenn die Validierung fehlschlägt. Wenn weggelassen, wird eine Standardmeldung verwendet.

### `@Uuid(version?: 'v1' | 'v3' | 'v4' | 'v5', message?: string)`

Validiert, dass das dekorierte Feld ein gültiger UUID-String ist, optional auf eine bestimmte Version beschränkt (v1, v3, v4 oder v5).

- **`version`** (optional): Die spezifische UUID-Version, gegen die validiert werden soll. Wenn weggelassen, wird gegen v1, v3, v4 oder v5 validiert.
- **`message`** (optional): Die Fehlermeldung, die angezeigt wird, wenn die Validierung fehlschlägt. Wenn weggelassen, wird eine Standardmeldung verwendet.

### `@Alphanumeric(message?: string)`

Validiert, dass das dekorierte Feld nur alphanumerische Zeichen enthält (englische Buchstaben und Ziffern, A–Z, a–z, 0–9).

- **`message`** (optional): Die Fehlermeldung, die angezeigt wird, wenn die Validierung fehlschlägt. Wenn weggelassen, wird eine Standardmeldung verwendet.

### `@IsUppercase(message?: string)`

Validiert, dass das dekorierte Feld nur Großbuchstaben enthält.

- **`message`** (optional): Die Fehlermeldung, die angezeigt wird, wenn die Validierung fehlschlägt. Wenn weggelassen, wird eine Standardmeldung verwendet.

### `@IsLowercase(message?: string)`

Validiert, dass das dekorierte Feld nur Kleinbuchstaben enthält.

- **`message`** (optional): Die Fehlermeldung, die angezeigt wird, wenn die Validierung fehlschlägt. Wenn weggelassen, wird eine Standardmeldung verwendet.

### `@IsJwt(message?: string)`

Validiert, dass das dekorierte Feld dem JWT-Format (`header.payload.signature`) entspricht. Jeder Teil muss aus Base64URL-Zeichen (A-Z, a-z, 0-9, `-`, `_`) bestehen. Dieser Dekorator prüft nur das Format — er überprüft nicht die Signatur oder die Token-Gültigkeit.

- **`message`** (optional): Die Fehlermeldung, die angezeigt wird, wenn die Validierung fehlschlägt. Wenn weggelassen, wird eine Standardmeldung verwendet.


### `@With(fieldName: string, message?: string)`

Validiert, dass, wenn das dekorierte Feld einen Wert hat, das angegebene Zielfeld (fieldName) ebenfalls einen Wert haben muss, wodurch eine zwingende Abhängigkeit zwischen den beiden Feldern hergestellt wird.

- **`fieldName`**: Der Name des Zielfelds, das ebenfalls einen Wert haben muss, wenn das dekorierte Feld einen Wert hat.
- **`message`** (optional): Die Fehlermeldung, die angezeigt wird, wenn die Validierung fehlschlägt. Wenn weggelassen, wird eine Standardmeldung verwendet.

### `@Without(fieldName: string, message?: string)`

Validiert, dass, wenn die dekorierte Eigenschaft einen Wert hat, die angegebene Zieleigenschaft KEINEN Wert haben darf, wodurch eine sich gegenseitig ausschließende Beziehung zwischen den beiden Eigenschaften hergestellt wird.

- **`fieldName`**: Der Name der Zieleigenschaft, die leer sein muss, wenn das dekorierte Feld einen Wert hat.
- **`message`** (optional): Die Fehlermeldung, die angezeigt wird, wenn die Validierung fehlschlägt. Wenn weggelassen, wird eine Standardmeldung verwendet.

### `@Each(...args: (Validator | Function)[])`

Validiert jedes einzelne Element innerhalb eines Arrays. Es kann andere Validierungs-Decorators oder benutzerdefinierte Validierungsfunktionen akzeptieren.

- `args`: Ein Validierungs-Decorator (z. B. @Min(5)) oder eine benutzerdefinierte Funktion (value: any) => boolean.

### `@ListMaxSize(max: number, message?: string)`

Überprüft, ob die Anzahl der Elemente im Array den angegebenen Höchstwert nicht überschreitet.

- **`max`**: Die maximale Anzahl von Elementen, die im Array erlaubt sind.
- **`message`** (optional): Die Fehlermeldung, die bei fehlgeschlagener Validierung angezeigt wird. Wenn weggelassen, wird eine Standardmeldung verwendet.

## Anwendungsbeispiel

Hier ist ein vollständiges Beispiel, wie Validierungs-Decorators innerhalb einer Express-Anwendung verwendet werden.

```typescript
import express, { Request, Response, NextFunction } from 'express'
import { bindingCargo, getCargo, Body, Min, Max, Suffix, CargoValidationError } from 'express-cargo'

// 1. Definieren Sie eine Klasse mit Quell- und Validierungsregeln
class CreateAssetRequest {
    @Body('name')
    assetName!: string

    @Body('type')
    @Suffix('.png')
    assetType!: string

    @Body('quantity')
    @Min(1)
    @Max(100)
    quantity!: number
}

const app = express()
app.use(express.json())

// 2. Wenden Sie die bindingCargo-Middleware auf eine Route an
app.post('/assets', bindingCargo(CreateAssetRequest), (req: Request, res: Response) => {
    // 3. Wenn die Validierung erfolgreich ist, greifen Sie mit getCargo auf die Daten zu
    const assetData = getCargo<CreateAssetRequest>(req)
    res.json({
        message: 'Asset erfolgreich erstellt!',
        data: assetData,
    })
})

// 4. Fügen Sie eine Fehlerbehandlungs-Middleware hinzu, um Validierungsfehler abzufangen
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        res.status(400).json({
            message: 'Validierung fehlgeschlagen',
            errors: err.errors.map(e => e.message),
        })
    } else {
        next(err)
    }
})

/*
Um diesen Endpunkt zu testen, senden Sie eine POST-Anfrage an /assets.

Beispiel für einen GÜLTIGEN Anfrage-Body:
{
    "name": "Mein-Asset",
    "type": "icon.png",
    "quantity": 10
}

Beispiel für einen UNGÜLTIGEN Anfrage-Body:
{
    "name": "Mein-Asset",
    "type": "icon.jpg", // Schlägt fehl bei @Suffix('.png')
    "quantity": 101     // Schlägt fehl bei @Max(100)
}
*/
```

## Fehlerbehandlung

Wenn die Validierung fehlschlägt, löst die `bindingCargo`-Middleware einen `CargoValidationError` aus. Sie sollten eine Express-Fehlerbehandlungs-Middleware registrieren, um diesen Fehler abzufangen und die Antwort zu formatieren.

Das `CargoValidationError`-Objekt verfügt über eine `errors`-Eigenschaft, die ein Array von `CargoFieldError`-Instanzen enthält. Jedes `CargoFieldError`-Objekt enthält eine `message`-Eigenschaft mit einem formatierten String, der den spezifischen Fehler detailliert beschreibt (z. B. `"quantity: quantity must be <= 100"`).

Wie im Codebeispiel gezeigt, ist eine übliche Methode zur Behandlung dieses Fehlers, über das `err.errors`-Array zu iterieren, um eine einfache Liste dieser Fehlermeldungen zu erstellen.

**Beispiel für eine Fehlerantwort:**

Wenn der ungültige Anfrage-Body aus dem obigen Beispiel gesendet wird, erzeugt der Fehlerbehandler die folgende JSON-Antwort, die ein Array formatierter Fehlermeldungen enthält.

```json
{
    "message": "Validierung fehlgeschlagen",
    "errors": [
        "type: assetType must end with .png",
        "quantity: quantity must be <= 100"
    ]
}
```
