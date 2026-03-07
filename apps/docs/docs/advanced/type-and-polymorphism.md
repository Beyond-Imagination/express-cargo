---
id: type-and-polymorphism
title: Type Transformation & Polymorphism
---

The `@Type` decorator is a powerful tool for converting plain JSON objects into actual class instances.

It is essential for maintaining type safety, utilizing class methods, and handling complex data structures such as nested objects and polymorphic arrays.

## Basic Nested Mapping

When a property needs to be an instance of another class, use `@Type` to specify the target class.

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
  @Type(() => Profile) // Automatically transforms into a Profile instance
  profile!: Profile;
}
```

## Resolving Circular Dependencies

If two classes reference each other (e.g., a `User` has many `Posts`, and a `Post` belongs to an `Author`), using a direct reference will cause a `ReferenceError` because the class may not be defined yet.

To solve this, use a **Thunk (arrow function)** to defer class resolution.

```typescript
class Post {
    @Body()
    title!: string;

    @Body()
    @Type(() => User) // Resolved lazily to avoid "User is not defined" error
    author!: User;
}

class User {
    @Body()
    name!: string;

    /**
     * @Type automatically detects the array type via metadata.
     * No explicit @List(Post) decorator is required.
     */
    @Body()
    @Type(() => Post)
    posts!: Post[];
}
```

## Dynamic Type Resolution

The most advanced feature of `@Type` is determining the target class at runtime based on the incoming data. This is particularly useful for handling inheritance and polymorphism.

### Functional Resolver

You can pass a function that inspects the data and returns the appropriate class.

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

### Structural Discriminator

For a cleaner and more declarative approach, use the `discriminator` option to map specific property values to their respective classes.

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