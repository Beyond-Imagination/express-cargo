# Transformateur personnalisé

Le décorateur `@Transform` vous permet de définir une logique de transformation personnalisée qui s'exécute **après** le casting de type intégré d'Express-Cargo. C'est idéal pour la normalisation avancée des entrées qui va au-delà de la simple conversion de type.

Pour l'utilisation de base de `@Transform`, consultez la page [Transformation Decorator](/decorators/transforms).

## Ordre d'exécution

Il est important de comprendre quand `@Transform` s'exécute :

1. La valeur brute est extraite de la source de la requête (`@Query`, `@Body`, etc.)
2. **Le casting de type intégré** convertit la valeur vers le type déclaré (`String`, `Number`, `Boolean`, `Date`)
3. **`@Transform`** s'exécute sur la valeur déjà castée
4. **La validation** est appliquée au résultat final

Cela signifie que votre fonction de transformation reçoit la valeur castée, pas la chaîne brute.

## Recettes pratiques

### Chaîne séparée par des virgules vers un tableau

Les paramètres de requête sont toujours des chaînes. Si votre API accepte une liste séparée par des virgules (ex : `?tags=a,b,c`), vous pouvez la diviser en tableau :

```typescript
class SearchRequest {
    @Query()
    @Transform((value: string) => value.split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// Résultat : { tags: ['node', 'express', 'cargo'] }
```

### Casting de chaînes similaires aux booléens

Express-Cargo caste automatiquement `"true"` en `true`, mais vous pourriez avoir besoin de gérer d'autres valeurs truthy comme `"yes"`, `"1"` ou `"on"` :

```typescript
class FilterRequest {
    @Query()
    @Transform((value: string) => ['true', 'yes', '1', 'on'].includes(String(value).toLowerCase()))
    active!: boolean
}

// GET /filter?active=yes → { active: true }
// GET /filter?active=0   → { active: false }
```

### Normalisation d'Enum

Normaliser les entrées utilisateur pour correspondre aux valeurs enum attendues :

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

### Assainissement des entrées de chaînes

Supprimer les caractères indésirables ou normaliser les espaces :

```typescript
class CommentRequest {
    @Body()
    @Transform((value: string) => value.trim().replace(/\s+/g, ' '))
    content!: string
}

// POST { content: "  hello   world  " } → { content: "hello world" }
```

### Limitation des plages numériques

S'assurer qu'un nombre reste dans une plage acceptable :

```typescript
class PaginationRequest {
    @Query()
    @Transform((value: number) => Math.min(Math.max(value, 1), 100))
    limit!: number
}

// GET /items?limit=500 → { limit: 100 }
// GET /items?limit=-5  → { limit: 1 }
```

### Manipulation de dates

Appliquer des ajustements aux dates parsées :

```typescript
class ReportRequest {
    @Query()
    @Transform((value: Date) => {
        // Définir l'heure au début de la journée (00:00:00)
        value.setHours(0, 0, 0, 0)
        return value
    })
    startDate!: Date
}
```

## Combinaison avec d'autres décorateurs

`@Transform` fonctionne parfaitement avec les autres décorateurs Express-Cargo :

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
Gardez les fonctions de transformation simples et focalisées sur une seule responsabilité. Si vous avez besoin de transformations complexes en plusieurs étapes, envisagez de composer des fonctions utilitaires :

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