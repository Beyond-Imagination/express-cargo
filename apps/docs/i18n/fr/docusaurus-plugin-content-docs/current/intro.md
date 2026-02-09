# Introduction à express-cargo

## Vue d'ensemble

express-cargo est une bibliothèque middleware légère
conçue pour le développement d'applications web basées sur le framework Express.js.
Cette bibliothèque exploite le pattern decorator pour fournir des fonctionnalités de liaison et de validation des données de requête basées sur les classes.
Elle permet le mapping automatique des divers formats de données reçus via les requêtes HTTP (Request)
vers des classes définies par le développeur,
et facilite simultanément la validation rationalisée de ces données.

## Pourquoi express-cargo ?

Bien qu'Express.js offre une architecture flexible,
des défis liés aux tâches répétitives et à la maintenance peuvent surgir lors du traitement des données de requête.
express-cargo relève ces défis de développement,
améliorant ainsi l'efficacité du développement et la robustesse du code.

### 1. Réduction du code répétitif

- **Défis de l'approche traditionnelle** : Dans un environnement Express.js, l'extraction de données depuis `req.body`, `req.query`,
  `req.params`, `req.headers`, et l'implémentation répétée de la logique de vérification de type et de validation dans chaque gestionnaire de route
  conduit à la duplication de code et à une diminution de la productivité.
- **Solution d'express-cargo** : express-cargo utilise des decorators pour définir de manière déclarative la logique d'extraction et de mapping des données
  au sein des classes Request. Les développeurs peuvent se concentrer sur la déclaration des sources de données, minimisant le code de traitement de données répétitif,
  et améliorant ainsi la productivité.

### 2. Sécurité des types et lisibilité améliorées

- **Défis de l'approche traditionnelle** : Dans un environnement JavaScript, la fiabilité du type des données de requête est faible,
  et même dans un environnement TypeScript, les assertions de type manuelles comportent le risque d'erreurs d'exécution. De plus, l'entremêlement
  de la logique de traitement des données et de la logique métier nuit souvent à la lisibilité du code.
- **Solution d'express-cargo** : En effectuant un mapping automatique des données et une conversion de type basée sur les types déclarés dans
  les classes Request, express-cargo permet la détection précoce des erreurs de type pendant la compilation et renforce la
  stabilité à l'exécution. Les classes DTO clairement définies représentent intuitivement la structure d'entrée attendue pour une API, améliorant la
  lisibilité du code.

### 3. Validation structurée et gestion cohérente des erreurs

- **Défis de l'approche traditionnelle** : Lorsque la logique de validation des données est dispersée dans plusieurs contrôleurs,
  la maintenance devient difficile et l'application d'une stratégie de gestion des erreurs cohérente devient complexe.
- **Solution d'express-cargo** : express-cargo fournit des decorators de validation intégrés et personnalisés, permettant aux règles de validation
  d'être définies de manière déclarative au sein des classes Request. La validation automatique est effectuée pendant le processus de
  liaison des données de requête, et en cas d'échec de validation, la gestion des erreurs définissable par l'utilisateur fournit des réponses
  cohérentes et prévisibles.

## ✨ Fonctionnalités clés

- Liaison de requête basée sur les classes
- Decorators de validation intégrés et personnalisés
- Support des objets imbriqués
- Conversion automatique de type
- Support des champs virtuels et des valeurs calculées
- Gestion des erreurs personnalisable

> Un middleware léger pour Express qui permet la liaison et la validation de requête basées sur les classes en utilisant des decorators.

express-cargo contribue à alléger le fardeau des tâches répétitives, à améliorer la qualité et la stabilité du code, et
permet aux développeurs de se concentrer sur l'implémentation de la logique métier principale dans l'environnement de développement Express.js.
Découvrez un développement d'application robuste et efficace avec Express.js en utilisant express-cargo.
