## Decorators intégrés

| Decorator    | Source        |
|--------------|---------------|
| `@Body()`    | `req.body`    |
| `@Query()`   | `req.query`   |
| `@Header()`  | `req.headers` |
| `@Uri()`     | `req.params`  |
| `@Params()`  | `req.params`  |
| `@Session()` | `req.session` |

## Détails des decorators

### `@Body()`

Extrait les données du corps de la requête HTTP et les lie au champ correspondant.

- source : `req.body`

---

### `@Query()`

Extrait les données des paramètres de requête HTTP et les lie au champ correspondant.

- source : `req.query`

---

### `@Header()`

Extrait les valeurs des en-têtes de requête HTTP et les lie au champ correspondant.
Il est couramment utilisé pour accéder aux métadonnées de requête telles que les jetons d'authentification (`Authorization`) ou les en-têtes personnalisés directement depuis un DTO.

- source : `req.headers`

---

### `@Uri()` / `@Params()`

Extrait les variables de chemin de l'URL de requête HTTP et les lie au champ correspondant.
Ceci est généralement utilisé pour recevoir des identifiants de ressource (tels que `id`) dans les API REST en tant que partie d'un DTO.

Les deux decorators effectuent le même comportement interne, et `@Uri()` est un alias de `@Params()`.

- source : `req.params`
- Couramment utilisé dans les routes telles que `/users/:id`, `/posts/:postId`

---

### `@Session()`

Extrait les valeurs stockées dans la session et les lie à un champ DTO.
Il est utile pour passer l'état côté serveur, tel que les informations d'utilisateur authentifié, dans un DTO.

- source : `req.session`
- Disponible uniquement lorsque le middleware de session est configuré

---

## Exemple d'utilisation

Voici un exemple de l'utilisation des decorators de source dans une application Express.

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
