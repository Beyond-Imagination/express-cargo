---
id: type-and-polymorphism
title: Typtransformation & Polymorphismus
---

Der `@Type`-Decorator ist ein mächtiges Werkzeug, um einfache JSON-Objekte in tatsächliche Klasseninstanzen umzuwandeln.

Er ist unerlässlich für die Aufrechterhaltung der Typsicherheit, die Nutzung von Klassenmethoden und die Handhabung komplexer Datenstrukturen wie verschachtelte Objekte und polymorphe Arrays.

## Grundlegende verschachtelte Zuordnung

Wenn eine Eigenschaft eine Instanz einer anderen Klasse sein muss, verwenden Sie `@Type`, um die Zielklasse anzugeben.

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
  @Type(() => Profile) // Transformiert automatisch in eine Profile-Instanz
  profile!: Profile;
}
```

## Auflösen von zirkulären Abhängigkeiten

Wenn zwei Klassen aufeinander verweisen (z. B. ein `User` hat viele `Posts` und ein `Post` gehört zu einem `Author`), führt die Verwendung einer direkten Referenz zu einem `ReferenceError`, da die Klasse möglicherweise noch nicht definiert ist.

Um dies zu lösen, verwenden Sie einen **Thunk (Pfeilfunktion)**, um die Klassenauflösung zu verzögern.

```typescript
class Post {
    @Body()
    title!: string;

    @Body()
    @Type(() => User) // Wird verzögert aufgelöst, um den Fehler "User is not defined" zu vermeiden
    author!: User;
}

class User {
    @Body()
    name!: string;

    /**
     * @Type erkennt den Array-Typ automatisch über Metadaten.
     * Kein expliziter @Array(Post)-Decorator erforderlich.
     */
    @Body()
    @Type(() => Post)
    posts!: Post[];
}
```

## Dynamische Typauflösung

Das fortschrittlichste Feature von `@Type` ist die Bestimmung der Zielklasse zur Laufzeit basierend auf den eingehenden Daten. Dies ist besonders nützlich für die Handhabung von Vererbung und Polymorphismus.

### Funktionaler Resolver

Sie können eine Funktion übergeben, die die Daten prüft und die entsprechende Klasse zurückgibt.

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

### Struktureller Diskriminator

Für einen saubereren und deklarativeren Ansatz verwenden Sie die `discriminator`-Option, um bestimmte Eigenschaftswerte ihren jeweiligen Klassen zuzuordnen.

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
