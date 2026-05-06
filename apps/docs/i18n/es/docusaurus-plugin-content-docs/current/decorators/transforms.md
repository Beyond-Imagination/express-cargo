# Decorador de transformación

Express-Cargo proporciona un decorador para transformar automáticamente los datos entrantes de la solicitud antes de enlazarlos a una clase. Esto es útil para tareas como normalizar la entrada del usuario (por ejemplo, convertir una cadena a minúsculas) o analizar una cadena separada por comas para convertirla en un array.

A diferencia de los campos virtuales, que combinan campos existentes para crear uno nuevo, este decorador de transformación modifica directamente el valor de un solo campo.

## `@Transform<T>(transformer: (value: T) => T)`

Este es el decorador principal para la transformación de datos. Recibe una función transformadora que obtiene el valor sin procesar de la solicitud y devuelve el nuevo valor transformado para el campo.

- `transformer`: Una función que acepta el valor sin procesar y devuelve el valor transformado.

## Ejemplo de uso

Este ejemplo demuestra cómo se puede usar el decorador `@Transform` para normalizar y procesar datos de solicitud en el formato deseado. Es muy útil para manejar entradas de usuario diversas y garantizar que tu API las procese de manera consistente, lo que mejora la estabilidad de la aplicación.

```typescript
import express, { Request, Response } from 'express'
import { bindingCargo, getCargo, Query, Transform } from 'express-cargo'

// 1. Define una clase con reglas de procesamiento y normalización de datos
class SearchRequest {
    // Convierte el parámetro de consulta 'sortBy' a minúsculas para ordenar de forma consistente
    @Query()
    @Transform((value: string) => value.toLowerCase())
    sortBy!: string

    // Duplica el valor del parámetro de consulta 'count'
    @Query()
    @Transform((value: number) => value * 2)
    count!: number
}

const app = express()
app.use(express.json())

// 2. Aplica el middleware bindingCargo a la ruta
app.get('/search', bindingCargo(SearchRequest), (req: Request, res: Response) => {
    // 3. Accede a los datos transformados con los tipos correctos
    const searchParams = getCargo<SearchRequest>(req)

    res.json({
        message: 'Parámetros de búsqueda transformados correctamente!',
        data: searchParams,
        // Verifica el tipo de los datos transformados
        sortByType: typeof searchParams.sortBy,
        countType: typeof searchParams.count,
    })
})

/*
Para probar este endpoint, envía una solicitud GET a /search.

URL de solicitud de ejemplo:
http://localhost:3000/search?sortBy=TITLE&count=10
*/
```

## Ejemplo de salida

Cuando se accede a la URL de ejemplo, el middleware `bindingCargo` procesa los parámetros de consulta. Después, los decoradores `@Transform` normalizan el valor de `sortBy` a una cadena en minúsculas y duplican el valor de `count`. La función `getCargo` devuelve un objeto con estos valores transformados.

```json
{
    "message": "Parámetros de búsqueda transformados correctamente!", 
    "data": {
        "sortBy": "title",
        "count": 20
    },
    "sortByType": "string",
    "countType": "number"
}
```
