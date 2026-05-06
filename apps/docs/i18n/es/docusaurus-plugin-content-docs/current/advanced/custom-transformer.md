# Transformador personalizado

El decorador `@Transform` te permite definir lógica de transformación personalizada que se ejecuta **después** de la conversión de tipos integrada de Express-Cargo. Está pensado para **refinar valores** —normalizar, limitar o sanear un valor cuyo tipo ya quedó decidido—, no para cambiar el tipo del campo.

Para el uso básico de `@Transform`, consulta la página [Decorador de transformación](/decorators/transforms).

:::note `@Transform` refina valores, no tipos
Como la conversión de tipos integrada (`String`, `Number`, `Boolean`, `Date`, `Array`) se ejecuta antes del transformador, tu función recibe el valor ya convertido y debería devolver el mismo tipo. Si el valor sin procesar de la solicitud no coincide con el tipo declarado (por ejemplo, una cadena separada por comas que llega a un campo declarado como `string[]`), la conversión de tipos fallará antes de que se ejecute tu transformador.

Cuando necesites producir un valor con una forma distinta de la fuente de datos original —por ejemplo, analizar una cadena delimitada para convertirla en un array, aceptar distintas representaciones de `true` para un booleano, etc.— usa el decorador [`@Request`](/decorators/virtual) en su lugar. Este omite por completo la conversión de tipos integrada y te entrega directamente el objeto `Request`. Consulta la sección [Cuándo usar `@Request` en su lugar](#cuándo-usar-request-en-su-lugar) a continuación.
:::

## Orden de ejecución

Es importante entender cuándo se ejecuta `@Transform`:

1. El valor sin procesar se extrae de la fuente de la solicitud (`@Query`, `@Body`, etc.).
2. **La conversión de tipos integrada** convierte el valor al tipo declarado (`String`, `Number`, `Boolean`, `Date`).
3. **`@Transform`** se ejecuta sobre el valor ya convertido.
4. **La validación** se aplica al resultado final.

Esto significa que tu función de transformación recibe el valor convertido, no la cadena original.

## Recetas prácticas

### Normalización de enums

Normaliza la entrada del usuario para que coincida con los valores esperados del enum:

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

### Sanitización de cadenas

Elimina caracteres no deseados o normaliza espacios en blanco:

```typescript
class CommentRequest {
    @Body()
    @Transform((value: string) => value.trim().replace(/\s+/g, ' '))
    content!: string
}

// POST { content: "  hello   world  " } → { content: "hello world" }
```

### Acotación de rangos numéricos

Garantiza que un número permanezca dentro de un rango aceptable:

```typescript
class PaginationRequest {
    @Query()
    @Transform((value: number) => Math.min(Math.max(value, 1), 100))
    limit!: number
}

// GET /items?limit=500 → { limit: 100 }
// GET /items?limit=-5  → { limit: 1 }
```

### Manipulación de fechas

Aplica ajustes a fechas analizadas:

```typescript
class ReportRequest {
    @Query()
    @Transform((value: Date) => {
        // Ajusta la hora al inicio del día (00:00:00)
        value.setHours(0, 0, 0, 0)
        return value
    })
    startDate!: Date
}
```

## Encadenamiento con otros decoradores

`@Transform` funciona sin problemas junto con otros decoradores de Express-Cargo:

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
Mantén las funciones transformadoras simples y centradas en una sola responsabilidad. Si necesitas transformaciones complejas de varios pasos, considera componer funciones utilitarias:

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

## Cuándo usar `@Request` en su lugar

Cuando el valor de la solicitud debe reconvertirse a un tipo diferente —no solo refinarse—, `@Transform` no es la herramienta adecuada, porque la conversión de tipos integrada se ejecuta primero y puede fallar o convertir el valor de una forma distinta a la esperada. Usa [`@Request`](/decorators/virtual) para omitir la conversión de tipos y trabajar directamente con el objeto `Request`.

### De cadena separada por comas a array

```typescript
class SearchRequest {
    @Request(req => String(req.query.tags ?? '').split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// Resultado: { tags: ['node', 'express', 'cargo'] }
```

### Parseo flexible de booleanos

Acepta distintas representaciones de `true` como `"yes"`, `"1"` u `"on"`, en lugar de aceptar solo `"true"`:

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
