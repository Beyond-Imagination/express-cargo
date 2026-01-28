## Integrierte Decorators

| Decorator    | Quelle        |
|--------------|---------------|
| `@Body()`    | `req.body`    |
| `@Query()`   | `req.query`   |
| `@Header()`  | `req.headers` |
| `@Uri()`     | `req.params`  |
| `@Params()`  | `req.params`  |
| `@Session()` | `req.session` |

## Decorator-Details

### `@Body()`

Extrahiert Daten aus dem HTTP-Anfrage-Body und bindet sie an das entsprechende Feld.

- Quelle: `req.body`

---

### `@Query()`

Extrahiert Daten aus den HTTP-Anfrage-Query-Parametern und bindet sie an das entsprechende Feld.

- Quelle: `req.query`

---

### `@Header()`

Extrahiert Werte aus den HTTP-Anfrage-Headern und bindet sie an das entsprechende Feld.
Es wird häufig verwendet, um direkt von einem DTO aus auf Anfragemetadaten wie Authentifizierungstoken (`Authorization`) oder benutzerdefinierte Header zuzugreifen.

- Quelle: `req.headers`

---

### `@Uri()` / `@Params()`

Extrahiert Pfadvariablen aus der HTTP-Anfrage-URL und bindet sie an das entsprechende Feld.
Dies wird typischerweise verwendet, um Ressourcenbezeichner (wie `id`) in REST-APIs als Teil eines DTO zu empfangen.

Beide Decorators führen intern das gleiche Verhalten aus, und `@Uri()` ist ein Alias von `@Params()`.

- Quelle: `req.params`
- Häufig verwendet in Routen wie `/users/:id`, `/posts/:postId`

---

### `@Session()`

Extrahiert Werte, die in der Session gespeichert sind, und bindet sie an ein DTO-Feld.
Es ist nützlich, um serverseitigen Status, wie z. B. authentifizierte Benutzerinformationen, in ein DTO zu übergeben.

- Quelle: `req.session`
- Nur verfügbar, wenn Session-Middleware konfiguriert ist

---

## Anwendungsbeispiel

Hier ist ein Beispiel, wie Quell-Decorators innerhalb einer Express-Anwendung verwendet werden.

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
