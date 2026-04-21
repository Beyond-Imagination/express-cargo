# Benutzerdefinierter Transformer

Mit dem `@Transform`-Dekorator können Sie benutzerdefinierte Transformationslogik definieren, die **nach** dem integrierten Type-Casting von Express-Cargo ausgeführt wird. Er ist darauf ausgelegt, **Werte zu verfeinern** — einen bereits typisierten Wert zu normalisieren, zu begrenzen oder zu bereinigen — und nicht dazu, den Typ des Feldes zu ändern.

Grundlegende Informationen zur Verwendung von `@Transform` finden Sie auf der Seite [Transformation Decorator](/decorators/transforms).

:::note `@Transform` verfeinert Werte, nicht Typen
Da das integrierte Type-Casting (`String`, `Number`, `Boolean`, `Date`, `Array`) vor dem Transformer läuft, erhält Ihre Funktion den bereits gecasteten Wert und sollte denselben Typ zurückgeben. Wenn der rohe Request-Wert nicht zum deklarierten Typ passt (z.B. ein kommagetrennter String auf einem als `string[]` deklarierten Feld), schlägt das Type-Casting fehl, bevor Ihr Transformer überhaupt ausgeführt wird.

Wenn Sie einen Wert in einer anderen Form als der Rohquelle erzeugen müssen — einen begrenzerbasierten String in ein Array parsen, mehrere truthy-Schreibweisen für einen Boolean akzeptieren usw. — verwenden Sie stattdessen den [`@Request`](/decorators/virtual)-Dekorator. Er umgeht das integrierte Type-Casting vollständig und übergibt Ihnen das `Request`-Objekt direkt. Siehe den Abschnitt [Wann stattdessen `@Request` verwenden](#when-to-use-request-instead) weiter unten.
:::

## Ausführungsreihenfolge

Es ist wichtig zu verstehen, wann `@Transform` ausgeführt wird:

1. Der Rohwert wird aus der Anfragequelle (`@Query`, `@Body` usw.) extrahiert
2. **Integriertes Type-Casting** konvertiert den Wert in den deklarierten Typ (`String`, `Number`, `Boolean`, `Date`)
3. **`@Transform`** wird auf den bereits gecasteten Wert ausgeführt
4. **Validierung** wird auf das Endergebnis angewendet

Das bedeutet, dass Ihre Transformer-Funktion den typgecasteten Wert erhält, nicht den rohen String.

## Praktische Rezepte

### Enum-Normalisierung

Benutzereingaben an erwartete Enum-Werte anpassen:

```typescript
enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

class ListRequest {
    @Query()
    @Transform((value: string) => value.toLowerCase() as SortOrder)
    order!: SortOrder
}

// GET /list?order=DESC → { order: 'desc' }
```

### String-Eingabe bereinigen

Unerwünschte Zeichen entfernen oder Leerzeichen normalisieren:

```typescript
class CommentRequest {
    @Body()
    @Transform((value: string) => value.trim().replace(/\s+/g, ' '))
    content!: string
}

// POST { content: "  hello   world  " } → { content: "hello world" }
```

### Numerische Bereiche begrenzen

Sicherstellen, dass eine Zahl innerhalb eines akzeptablen Bereichs bleibt:

```typescript
class PaginationRequest {
    @Query()
    @Transform((value: number) => Math.min(Math.max(value, 1), 100))
    limit!: number
}

// GET /items?limit=500 → { limit: 100 }
// GET /items?limit=-5  → { limit: 1 }
```

### Datumsmanipulation

Anpassungen auf geparste Daten anwenden:

```typescript
class ReportRequest {
    @Query()
    @Transform((value: Date) => {
        // Zeit auf Tagesbeginn setzen (00:00:00)
        value.setHours(0, 0, 0, 0)
        return value
    })
    startDate!: Date
}
```

## Kombination mit anderen Dekoratoren

`@Transform` funktioniert nahtlos mit anderen Express-Cargo-Dekoratoren:

```typescript
class ProductQuery {
    @Query('q')
    @Transform((value: string) => value.toLowerCase().trim())
    @IsNotEmpty()
    searchTerm!: string

    @Query()
    @Default(10)
    @Transform((value: number) => Math.min(value, 50))
    limit!: number
}
```

:::tip
Halten Sie Transformer-Funktionen einfach und fokussiert auf eine einzige Verantwortung. Wenn Sie komplexe mehrstufige Transformationen benötigen, erwägen Sie die Komposition von Hilfsfunktionen:

```typescript
const normalize = (v: string) => v.trim().toLowerCase()
const clamp = (min: number, max: number) => (v: number) => Math.min(Math.max(v, min), max)

class Request {
    @Query()
    @Transform(normalize)
    keyword!: string

    @Query()
    @Transform(clamp(1, 100))
    page!: number
}
```
:::

## Wann stattdessen `@Request` verwenden {#when-to-use-request-instead}

Wenn der Anfragewert nicht nur verfeinert, sondern **in einen anderen Typ umgeformt** werden muss, ist `@Transform` das falsche Werkzeug, weil das integrierte Type-Casting zuerst läuft und den Wert entweder fehlschlagen lässt oder von Ihrer Erwartung wegzwingt. Verwenden Sie [`@Request`](/decorators/virtual), um das Type-Casting zu umgehen und direkt mit dem `Request`-Objekt zu arbeiten.

### Kommagetrennter String zu Array

```typescript
class SearchRequest {
    @Request(req => String(req.query.tags ?? '').split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// Ergebnis: { tags: ['node', 'express', 'cargo'] }
```

### Flexibles Boolean-Parsing

Mehrere truthy-Schreibweisen wie `"yes"`, `"1"` oder `"on"` akzeptieren, nicht nur `"true"`:

```typescript
class FilterRequest {
    @Request(req => {
        const raw = String(req.query.active ?? '').toLowerCase()
        return ['true', 'yes', '1', 'on'].includes(raw)
    })
    active!: boolean
}

// GET /filter?active=yes → { active: true }
// GET /filter?active=0   → { active: false }
```