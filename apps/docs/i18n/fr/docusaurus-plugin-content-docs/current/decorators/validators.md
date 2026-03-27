# Décorateurs de validation

Express-Cargo utilise des décorateurs pour valider les données de requête entrantes qui sont liées à une classe.

La validation n'est pas effectuée par une fonction `validate` autonome. Au lieu de cela, elle est intégrée dans le middleware `bindingCargo`, qui valide automatiquement les données pendant le cycle de vie de la requête.

## Validateurs intégrés

### `@Optional()`

Marque un champ comme optionnel, lui permettant d'être omis ou défini sur `undefined` sans déclencher d'erreurs de validation.

### `@Min(value: number)`

Valide qu'un nombre est supérieur ou égal à la valeur minimale spécifiée.

- **`value`** : La valeur minimale autorisée.

### `@Max(value: number)`

Valide qu'un nombre est inférieur ou égal à la valeur maximale spécifiée.

- **`value`** : La valeur maximale autorisée.

### `@Range(min: number, max: number)`

Valide qu'un nombre est dans la plage spécifiée, inclusivement des valeurs minimale et maximale.

- **`min`** : La valeur minimale autorisée.
- **`max`** : La valeur maximale autorisée.

### `@Prefix(value: string)`

Valide qu'une chaîne commence par le préfixe spécifié.

- **`value`** : Le texte de début requis.

### `@Suffix(value: string)`

Valide qu'une chaîne se termine par le suffixe spécifié.

- **`value`** : Le texte de fin requis.

### `@Equal(value: any)`

Valide qu'une valeur est strictement égale (`===`) à la valeur spécifiée.

- **`value`** : La valeur à comparer.

### `@NotEqual(value: any)`

Valide qu'une valeur n'est strictement pas égale (`!==`) à la valeur spécifiée.

- **`value`** : La valeur à comparer.

### `@IsTrue()`

Valide que la propriété décorée est vraie.

### `@IsFalse()`

Valide que la propriété décorée est fausse.

### `@Length(value: number)`

Valide que la longueur de la chaîne décorée est exactement la valeur spécifiée.

- **`value`** : La longueur exacte requise en caractères

### `@MaxLength(value: number)`

Valide que la longueur de la chaîne décorée ne dépasse pas le maximum spécifié.

- **`value`** : La longueur maximale autorisée en caractères.

### `@MinLength(value: number)`

Valide que la longueur de la chaîne décorée est au moins le minimum spécifié.

- **`value`** : La longueur minimale autorisée en caractères.

### `@OneOf(values: any[])`

Valide que la valeur d'entrée est l'une des valeurs spécifiées.

- **`values`** : Le tableau des valeurs autorisées.

### `@ListContains(values: any[], comparator?: (expected, actual) => boolean, message?: string)`

Valide que le tableau contient toutes les valeurs spécifiées. Prend en charge les valeurs primitives, les objets, les Date et les types mixtes.

- **`values`**: Les valeurs qui doivent être présentes dans le tableau.
- **`comparator`** (optionnel): Une fonction de comparaison personnalisée `(expected, actual) => boolean`. Lorsqu'elle est fournie, toutes les comparaisons lui sont déléguées, y compris les primitives.
- **`message`** (optionnel): Le message d'erreur à afficher en cas d'échec de la validation. S'il est omis, un message par défaut sera utilisé.

> **Avertissement**: La comparaison d'objets utilise l'égalité profonde par défaut. Les performances peuvent se dégrader lorsque `values` contient de nombreux objets ou des structures profondément imbriquées. Envisagez d'utiliser un `comparator` pour une comparaison plus efficace ou flexible.

### `@Enum(enumObj: object, message?: string)`

Valide que la valeur d'entrée correspond à l'une des valeurs de l'objet enum spécifié.
Il transforme également automatiquement la valeur d'entrée (par exemple, la clé de chaîne) en la valeur enum correspondante.

- **`enumObj`**: L'objet enum à valider.
- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@Validate(validateFn: (value: unknown) => boolean, message?: string)`

Valide une valeur en utilisant une fonction de validation personnalisée.
Ce décorateur offre la flexibilité d'implémenter une logique de validation au-delà des validateurs intégrés.

- **`validateFn`** : Une fonction qui reçoit la valeur du champ et retourne true si valide, false sinon.
- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@Regexp(pattern: RegExp, message?: string)`

Valide que le champ décoré correspond au modèle d'expression régulière spécifié.
Ce décorateur est utile pour appliquer des règles de format telles que les e-mails, les numéros de téléphone, etc.

- **`pattern`** : Un objet RegExp utilisé pour tester la valeur du champ. La valeur est valide si elle correspond au modèle.
- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@Email()`

Valide que la propriété décorée est une adresse e-mail valide.

### `@Alpha(message?: string)`

Valide que le champ décoré contient uniquement des caractères alphabétiques (lettres anglaises majuscules ou minuscules, A–Z / a–z).

- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@Uuid(version?: 'v1' | 'v3' | 'v4' | 'v5', message?: string)`

Valide que le champ décoré est une chaîne UUID valide, éventuellement limitée à une version spécifique (v1, v3, v4 ou v5).

- **`version`** (optionnel) : La version UUID spécifique à valider. S'il est omis, il valide contre v1, v3, v4 ou v5.
- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@Alphanumeric(message?: string)`

Valide que le champ décoré contient uniquement des caractères alphanumériques (lettres anglaises et chiffres, A–Z, a–z, 0–9).

- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@IsUppercase(message?: string)`

Valide que le champ décoré contient uniquement des caractères en majuscules.

- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@IsLowercase(message?: string)`

Valide que le champ décoré contient uniquement des caractères en minuscules.

- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@IsJwt(message?: string)`

Valide que le champ décoré suit le format JWT (`header.payload.signature`). Chaque partie doit être composée de caractères Base64URL (A-Z, a-z, 0-9, `-`, `_`). Ce décorateur vérifie uniquement le format — il ne valide pas la signature ni la validité du token.

- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@IsUrl(options?: IsUrlOptions, message?: string)`

Valide que le champ décoré est une URL valide. Par défaut, les protocoles `http`, `https` et `ftp` sont autorisés.

- **`options`** (optionnel) :
  - **`protocols`** : Un tableau des protocoles autorisés. Par défaut : `['http', 'https', 'ftp']`.
- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@IsHexadecimal(message?: string)`

Valide que le champ décoré est un nombre hexadécimal. Seuls les caractères `0-9` et `a-f` (insensible à la casse) sont autorisés. Le préfixe `0x` n'est pas autorisé.

- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@MinDate(min: Date | (() => Date), message?: string)`

Valide que le champ décoré est un `Date` égal ou postérieur à la date minimale donnée. Accepte un `Date` fixe ou une fonction qui retourne un `Date` pour une comparaison dynamique.

- **`min`** : La date minimale autorisée, ou une fonction qui la retourne.
- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@With(fieldName: string, message?: string)`

Valide que si le champ décoré a une valeur, le champ cible spécifié (fieldName) doit également avoir une valeur, établissant une dépendance obligatoire entre les deux champs.

- **`fieldName`** : Le nom du champ cible qui doit également avoir une valeur si le champ décoré a une valeur.
- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@Without(fieldName: string, message?: string)`

Valide que si la propriété décorée a une valeur, la propriété cible spécifiée ne doit PAS avoir de valeur, établissant une relation mutuellement exclusive entre les deux propriétés.

- **`fieldName`** : Le nom de la propriété cible qui doit être vide si le champ décoré a une valeur.
- **`message`** (optionnel) : Le message d'erreur à afficher lorsque la validation échoue. S'il est omis, un message par défaut sera utilisé.

### `@Each(...args: (Validator | Function)[])`

Valide chaque élément individuel dans un tableau. Il peut accepter d'autres décorateurs de validation ou des fonctions de validation personnalisées.

- `args` : Un décorateur de validation (par exemple, @Min(5)) ou une fonction personnalisée (value: any) => boolean.

### `@ListMaxSize(max: number, message?: string)`

Valide que le tableau ne contient pas plus que le nombre d'éléments spécifié.

- **`max`**: Le nombre maximum d'éléments autorisés dans le tableau.
- **`message`** (optionnel) : Le message d'erreur à afficher en cas d'échec de la validation. S'il est omis, un message par défaut sera utilisé.

### `@ListMinSize(min: number, message?: string)`

Vérifie que le tableau contient au moins le nombre d'éléments spécifié.

- **`min`**: Le nombre minimum d'éléments autorisés dans le tableau.
- **`message`** (facultatif): Le message d'erreur à afficher en cas d'échec de la validation. Si omis, un message par défaut sera utilisé.

## Exemple d'utilisation

Voici un exemple complet de l'utilisation des décorateurs de validation dans une application Express.

```typescript
import express, { Request, Response, NextFunction } from 'express'
import { bindingCargo, getCargo, Body, Min, Max, Suffix, CargoValidationError } from 'express-cargo'

// 1. Définir une classe avec les règles de source et de validation
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

// 2. Appliquer le middleware bindingCargo à une route
app.post('/assets', bindingCargo(CreateAssetRequest), (req: Request, res: Response) => {
    // 3. Si la validation réussit, accéder aux données en utilisant getCargo
    const assetData = getCargo<CreateAssetRequest>(req)
    res.json({
        message: 'Ressource créée avec succès !',
        data: assetData,
    })
})

// 4. Ajouter un middleware de gestion des erreurs pour capturer les erreurs de validation
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        res.status(400).json({
            message: 'Échec de la validation',
            errors: err.errors.map(e => e.message),
        })
    } else {
        next(err)
    }
})

/*
Pour tester ce point de terminaison, envoyez une requête POST à /assets.

Exemple de corps de requête VALIDE :
{
    "name": "Mon-Ressource",
    "type": "icone.png",
    "quantity": 10
}

Exemple de corps de requête INVALIDE :
{
    "name": "Mon-Ressource",
    "type": "icone.jpg", // Échoue @Suffix('.png')
    "quantity": 101     // Échoue @Max(100)
}
*/
```

## Gestion des erreurs

Lorsque la validation échoue, le middleware `bindingCargo` lève une `CargoValidationError`. Vous devez enregistrer un middleware de gestion des erreurs Express pour capturer cette erreur et formater la réponse.

L'objet `CargoValidationError` a une propriété `errors`, qui contient un tableau d'instances `CargoFieldError`. Chaque objet `CargoFieldError` contient une propriété `message` avec une chaîne formatée détaillant l'erreur spécifique (par exemple, `"quantity: quantity must be <= 100"`).

Comme montré dans l'exemple de code, une manière courante de gérer cela est de mapper le tableau `err.errors` pour créer une simple liste de ces messages d'erreur.

**Exemple de réponse d'erreur :**

Lorsque le corps de requête invalide de l'exemple ci-dessus est envoyé, le gestionnaire d'erreurs produira la réponse JSON suivante, qui contient un tableau de messages d'erreur formatés.

```json
{
    "message": "Échec de la validation",
    "errors": [
        "type: assetType must end with .png",
        "quantity: quantity must be <= 100"
    ]
}
```
