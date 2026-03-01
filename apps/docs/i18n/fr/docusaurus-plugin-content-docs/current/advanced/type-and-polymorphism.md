---
id: type-and-polymorphism
title: Transformation de type et polymorphisme
---

Le décorateur `@Type` est un outil puissant pour convertir des objets JSON simples en instances de classe réelles.

Il est essentiel pour maintenir la sécurité des types, utiliser les méthodes de classe et gérer des structures de données complexes telles que des objets imbriqués et des tableaux polymorphes.

## Mapping imbriqué de base

Lorsqu'une propriété doit être une instance d'une autre classe, utilisez `@Type` pour spécifier la classe cible.

```typescript
import { Body, Type } from 'express-cargo';

class Profile {
  @Body()
  bio!: string;
}

class User {
  @Body()
  name!: string;

  @Body()
  @Type(() => Profile) // Transforme automatiquement en une instance de Profile
  profile!: Profile;
}
```

## Résolution des dépendances circulaires

Si deux classes se référencent mutuellement (par exemple, un `User` a plusieurs `Posts`, et un `Post` appartient à un `Author`), utiliser une référence directe causera une `ReferenceError` car la classe peut ne pas être encore définie.

Pour résoudre cela, utilisez un **Thunk (fonction fléchée)** pour différer la résolution de classe.

```typescript
class Post {
    @Body()
    title!: string;

    @Body()
    @Type(() => User) // Résolu paresseusement pour éviter l'erreur "User is not defined"
    author!: User;
}

class User {
    @Body()
    name!: string;

    /**
     * @Type détecte automatiquement le type de tableau via les métadonnées.
     * Aucun décorateur @List(Post) explicite n'est requis.
     */
    @Body()
    @Type(() => Post)
    posts!: Post[];
}
```

## Résolution de type dynamique

La fonctionnalité la plus avancée de `@Type` est de déterminer la classe cible à l'exécution en fonction des données entrantes. Ceci est particulièrement utile pour gérer l'héritage et le polymorphisme.

### Résolveur fonctionnel

Vous pouvez passer une fonction qui inspecte les données et retourne la classe appropriée.

```typescript
class Example {
    @Type((data) => {
        if (data.type === 'video') return Video;
        if (data.type === 'image') return Image;
        return DefaultMedia;
    })
    featuredMedia!: Video | Image | DefaultMedia;
}
```

### Discriminateur structurel

Pour une approche plus propre et plus déclarative, utilisez l'option `discriminator` pour mapper des valeurs de propriété spécifiques à leurs classes respectives.

```typescript
class Example {
    @Type(() => Media, {
        discriminator: {
            property: 'kind',
            subTypes: [
                { name: 'v', value: Video },
                { name: 'i', value: Image },
            ],
        },
    })
    gallery!: (Video | Image)[];
}
```
