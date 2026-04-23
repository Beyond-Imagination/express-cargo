## Decoradores integrados

| Decorador    | Fuente        |
|--------------|---------------|
| `@Body()`    | `req.body`    |
| `@Query()`   | `req.query`   |
| `@Header()`  | `req.headers` |
| `@Uri()`     | `req.params`  |
| `@Params()`  | `req.params`  |
| `@Session()` | `req.session` |

## Detalles de los decoradores

### `@Body()`

Extrae datos del cuerpo de la solicitud HTTP y los enlaza al campo correspondiente.

- fuente: `req.body`

---

### `@Query()`

Extrae datos de los parámetros de consulta de la solicitud HTTP y los enlaza al campo correspondiente.

- fuente: `req.query`

---

### `@Header()`

Extrae valores de los encabezados de la solicitud HTTP y los enlaza al campo correspondiente.  
Se usa comúnmente para acceder a metadatos de la solicitud, como tokens de autenticación (`Authorization`) o encabezados personalizadas, directamente desde un DTO.

- fuente: `req.headers`

---

### `@Uri()` / `@Params()`

Extrae variables de ruta de la URL de la solicitud HTTP y las enlaza al campo correspondiente.  
Normalmente se usa para recibir identificadores de recursos (como `id`) en APIs REST como parte de un DTO.

Ambos decoradores realizan el mismo comportamiento interno, y `@Uri()` es un alias de `@Params()`.

- fuente: `req.params`
- Uso común en rutas como `/users/:id`, `/posts/:postId`

---

### `@Session()`

Extrae valores almacenados en la sesión y los enlaza a un campo del DTO.  
Es útil para pasar estado del lado del servidor, como información del usuario autenticado, a un DTO.

- fuente: `req.session`
- Solo está disponible cuando el middleware de sesión está configurado

---

## Ejemplo de uso

Este es un ejemplo de cómo usar decoradores de fuente dentro de una aplicación Express.

```typescript
class Request {
    @Body('email')
    email!: string

    @Query('limit')
    limit!: number

    @Header('Authorization')
    authorization!: string
}
```
