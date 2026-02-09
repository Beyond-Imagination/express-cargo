---
title: FAQ
sidebar_label: FAQ
---

Trouvez des réponses aux questions courantes concernant l'utilisation de la bibliothèque. Cliquez sur une question pour révéler la réponse.

### 1. Démarrage

<details>
<summary><b>Q : Qu'est-ce que le projet express-cargo ?</b></summary>

**R :** Il s'agit d'un middleware conçu pour automatiser le traitement répétitif et fastidieux des données de requête (`req.body`, `req.query`, etc.) dans Express.js en utilisant une approche basée sur les classes. En utilisant les décorateurs TypeScript, vous pouvez gérer la liaison et la validation des données de manière déclarative en un seul endroit.
</details>

<details>
<summary><b>Q : Y a-t-il des précautions pour l'installation ?</b></summary>

**R :** **Node.js version 20 ou supérieure** est recommandée. Elle est conçue pour être intégrée de manière flexible dans les projets Express existants en tant que middleware standard.
</details>

<details>
<summary><b>Q : La configuration TypeScript est-elle obligatoire ?</b></summary>

**R :** Oui. Puisqu'elle utilise des décorateurs, les deux options suivantes doivent être définies sur `true` dans votre `tsconfig.json` :
- `experimentalDecorators: true`
- `emitDecoratorMetadata: true`

De plus, le package `reflect-metadata` doit être installé pour lire les informations de type à l'exécution.
</details>

### 2. Liaison de données et décorateurs

<details>
<summary><b>Q : Quelle est la différence entre `@Body` et `@Query` ?</b></summary>

**R :** La différence réside dans la source de l'extraction des données :
- **`@Body`** : Extrait les données du corps de la requête HTTP. Principalement utilisé pour les requêtes `POST` et `PUT`.
- **`@Query`** : Extrait les paramètres de la chaîne de requête URL (par exemple, `?id=1&name=test`). Principalement utilisé pour le filtrage ou le tri dans les requêtes `GET`.
- Vous pouvez également lier diverses autres données de requête en utilisant `@Params()` (ou `@Uri()`), `@Header()` et `@Session()`.
</details>

<details>
<summary><b>Q : Qu'est-ce que @Uri() ? Est-ce différent de @Params() ?</b></summary>

**R :** `@Uri()` est un **alias** pour `@Params()`. Vous pouvez choisir entre eux en fonction de votre préférence de lisibilité lors de la liaison des paramètres de chemin URL (par exemple, `/:id`).
</details>

<details>
<summary><b>Q : Comment récupérer les données liées ?</b></summary>

**R :** Après avoir passé le middleware `bindingCargo(ClassName)` dans votre routeur, vous pouvez récupérer l'instance dans le gestionnaire en appelant la fonction `getCargo<ClassName>(req)`.
</details>

### 3. Validation et transformation

<details>
<summary><b>Q : Comment les échecs de validation sont-ils gérés ?</b></summary>

**R :** La validation est effectuée en interne en utilisant des décorateurs tels que `@Min`, `@Max` et `@Length`. Si des données invalides sont détectées, le middleware retourne automatiquement une réponse d'erreur ou lève une exception.
</details>

<details>
<summary><b>Q : Comment puis-je traiter ou transformer les valeurs de champ ?</b></summary>

**R :** Utilisez le décorateur **`@Transform()`**. Par exemple, écrire `@Transform(v => v.trim())` vous permet de transformer les données d'entrée dans le format souhaité avant la liaison.
</details>

<details>
<summary><b>Q : Comment éviter les erreurs si un champ spécifique est manquant ?</b></summary>

**R :** Utilisez le décorateur **`@Optional()`**. Le champ sera lié avec succès même si la valeur est `null` ou `undefined`, en sautant la validation pour ce champ.
</details>

### 4. Compatibilité des frameworks

<details>
<summary><b>Q : Puis-je l'utiliser avec Fastify ou NestJS ?</b></summary>

**R :** Cette bibliothèque est spécifiquement conçue comme **middleware exclusif pour Express.js**.
- **NestJS** : NestJS possède son propre `ValidationPipe` et ses décorateurs, qui peuvent chevaucher les fonctionnalités. Bien que techniquement possible si vous utilisez l'adaptateur Express, l'objectif principal de cette bibliothèque est d'améliorer l'expérience développeur dans les environnements Express purs.
- **Fastify** : Actuellement non officiellement supporté.
</details>

### 5. Dépannage

<details>
<summary><b>Q : Pourquoi les données de mon instance de classe retournent-elles `undefined` ?</b></summary>

**R :** Veuillez vérifier les deux points suivants :
- Un middleware d'analyse du corps comme `express.json()` est-il déclaré **avant** `bindingCargo` ?
- `reflect-metadata` est-il importé tout en haut du point d'entrée de votre application ?
</details>

<details>
<summary><b>Q : La conversion de type automatique a-t-elle lieu ?</b></summary>

**R :** Oui. Elle tente de convertir automatiquement les valeurs en fonction des types définis dans les champs de classe (`string`, `number`, `boolean`, etc.). Par exemple, une chaîne `"123"` provenant de `@Query()` sera automatiquement convertie en nombre si le type du champ est défini comme `number`.
</details>

### 6. Divers

<details>
<summary><b>Q : Puis-je l'utiliser gratuitement dans des projets commerciaux ?</b></summary>

**R :** Cette bibliothèque est sous licence **MIT**. Vous êtes libre de l'utiliser, de la modifier et de la distribuer même à des fins commerciales sans restrictions.
</details>
