# Benutzerdefinierter Transformer

Mit dem `@Transform`-Dekorator können Sie benutzerdefinierte Transformationslogik definieren, die **nach** dem integrierten Type-Casting von Express-Cargo ausgeführt wird. Dies ist ideal für fortgeschrittene Eingabenormalisierung, die über einfache Typkonvertierung hinausgeht.

Grundlegende Informationen zur Verwendung von `@Transform` finden Sie auf der Seite [Transformation Decorator](/docs/decorators/transforms).

## Ausführungsreihenfolge

Es ist wichtig zu verstehen, wann `@Transform` ausgeführt wird:

1. Der Rohwert wird aus der Anfragequelle (`@Query`, `@Body` usw.) extrahiert
2. **Integriertes Type-Casting** konvertiert den Wert in den deklarierten Typ (`String`, `Number`, `Boolean`, `Date`)
3. **`@Transform`** wird auf den bereits gecasteten Wert ausgeführt
4. **Validierung** wird auf das Endergebnis angewendet

Das bedeutet, dass Ihre Transformer-Funktion den typgecasteten Wert erhält, nicht den rohen String.

## Praktische Rezepte

### Kommagetrennte Zeichenkette in Array umwandeln

Query-Parameter sind immer Strings. Wenn Ihre API eine kommagetrennte Liste akzeptiert (z.B. `?tags=a,b,c`), können Sie diese in ein Array aufteilen:

```typescript
class SearchRequest {
    @Query()
    @Transform((value: string) => value.split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// Ergebnis: { tags: ['node', 'express', 'cargo'] }
```

### Boolean-ähnliche String-Konvertierung

Express-Cargo castet `"true"` automatisch zu `true`, aber Sie müssen möglicherweise andere truthy Werte wie `"yes"`, `"1"` oder `"on"` verarbeiten:

```typescript
class FilterRequest {
    @Query()
    @Transform((value: string) => ['true', 'yes', '1', 'on'].includes(String(value).toLowerCase()))
    active!: boolean
}

// GET /filter?active=yes → { active: true }
// GET /filter?active=0   → { active: false }
```

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