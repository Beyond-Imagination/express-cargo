# Transformateur personnalisé

Le décorateur `@Transform` vous permet de définir une logique de transformation personnalisée qui s'exécute **après** le casting de type intégré d'Express-Cargo. Il est conçu pour **affiner des valeurs** — normaliser, borner ou nettoyer une valeur dont le type est déjà fixé — et non pour changer le type du champ.

Pour l'utilisation de base de `@Transform`, consultez la page [Transformation Decorator](/decorators/transforms).

:::note `@Transform` affine les valeurs, pas les types
Comme le casting de type intégré (`String`, `Number`, `Boolean`, `Date`, `Array`) s'exécute avant le transformateur, votre fonction reçoit la valeur déjà castée et doit retourner le même type. Si la valeur brute de la requête ne correspond pas au type déclaré (par exemple, une chaîne séparée par des virgules arrivant sur un champ déclaré `string[]`), le casting de type échouera avant même que votre transformateur ne s'exécute.

Lorsque vous devez produire une valeur d'une forme différente de la source brute — analyser une chaîne délimitée en tableau, accepter plusieurs orthographes truthy pour un booléen, etc. — utilisez plutôt le décorateur [`@Request`](/decorators/virtual). Il contourne entièrement le casting de type intégré et vous remet directement l'objet `Request`. Voir la section [Quand utiliser `@Request` à la place](#when-to-use-request-instead) ci-dessous.
:::

## Ordre d'exécution

Il est important de comprendre quand `@Transform` s'exécute :

1. La valeur brute est extraite de la source de la requête (`@Query`, `@Body`, etc.)
2. **Le casting de type intégré** convertit la valeur vers le type déclaré (`String`, `Number`, `Boolean`, `Date`)
3. **`@Transform`** s'exécute sur la valeur déjà castée
4. **La validation** est appliquée au résultat final

Cela signifie que votre fonction de transformation reçoit la valeur castée, pas la chaîne brute.

## Recettes pratiques

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

## Quand utiliser `@Request` à la place {#when-to-use-request-instead}

Lorsque la valeur de la requête doit être **remodelée en un type différent** — et pas simplement affinée — `@Transform` n'est pas le bon outil, car le casting de type intégré s'exécute en premier et fera soit échouer la valeur, soit la forcera loin de ce que vous attendiez. Utilisez [`@Request`](/decorators/virtual) pour contourner le casting de type et travailler directement avec l'objet `Request`.

### Chaîne séparée par des virgules vers un tableau

```typescript
class SearchRequest {
    @Request(req => String(req.query.tags ?? '').split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// Résultat : { tags: ['node', 'express', 'cargo'] }
```

### Analyse booléenne flexible

Accepter plusieurs orthographes truthy telles que `"yes"`, `"1"` ou `"on"`, et pas seulement `"true"` :

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