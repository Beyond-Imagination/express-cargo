---
id: type-and-polymorphism
title: Transformación de tipos y polimorfismo
---

El decorador `@Type` es una herramienta potente para convertir objetos JSON planos en instancias reales de clases.

Es esencial para mantener la seguridad de tipos, utilizar métodos de clase y manejar estructuras de datos complejas, como objetos anidados y arrays polimórficos.

## Mapeo anidado básico

Cuando una propiedad necesita ser una instancia de otra clase, usa `@Type` para especificar la clase destino.

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
  @Type(() => Profile) // Lo transforma automáticamente en una instancia de Profile
  profile!: Profile;
}
```

## Resolución de dependencias circulares

Si dos clases se referencian entre sí (por ejemplo, un `User` tiene muchos `Posts` y un `Post` pertenece a un `Author`), usar una referencia directa provocará un `ReferenceError` porque la clase puede no estar definida todavía.

Para resolverlo, usa un **Thunk (función flecha)** para diferir la resolución de la clase.

```typescript
class Post {
    @Body()
    title!: string;

    @Body()
    @Type(() => User) // Se resuelve de forma diferida para evitar el error "User is not defined"
    author!: User;
}

class User {
    @Body()
    name!: string;

    /**
     * @Type detecta automáticamente el tipo de array mediante metadatos.
     * No se requiere un decorador @List(Post) explícito.
     */
    @Body()
    @Type(() => Post)
    posts!: Post[];
}
```

## Resolución dinámica de tipos

La característica más avanzada de `@Type` es determinar la clase destino en tiempo de ejecución según los datos entrantes. Esto es especialmente útil para manejar herencia y polimorfismo.

### Resolver funcional

Puedes pasar una función que inspeccione los datos y devuelva la clase adecuada.

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

### Discriminador estructural

Para un enfoque más limpio y declarativo, usa la opción `discriminator` para asignar valores específicos de una propiedad a sus clases correspondientes.

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
