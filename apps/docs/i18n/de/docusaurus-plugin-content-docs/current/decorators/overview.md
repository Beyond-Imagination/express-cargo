# Decorators-Übersicht

## Was sind Decorators?
Decorators in express-cargo annotieren Klassenfelder, um der Middleware mitzuteilen:

- Woher Daten extrahiert werden sollen (z. B. Body, Query)
- Wie sie validiert werden sollen
- Wie sie transformiert werden sollen

Wenn Sie eine Klasse an `bindingCargo` übergeben, liest die Middleware diese Decorators, um ein typsicheres Objekt zu erstellen, zu validieren und zu transformieren, das Sie mit `getCargo` abrufen.

## Decorator-Kategorien

Decorators werden nach der Rolle gruppiert, die sie in der Binding-Pipeline spielen.

| Kategorie | Zweck | Beispiele | Referenz |
|-----------|-------|-----------|----------|
| **Source** | Bestimmt, woher der Wert eines Feldes stammt | `@Body`, `@Query`, `@Header`, `@Uri` / `@Params`, `@Session` | [Source-Decorators](./source-decorators.md) |
| **File** | Bindet hochgeladene Dateien aus einer `multipart/form-data`-Anfrage | `@UploadedFile`, `@UploadedFiles` | [Datei-Upload-Decorators](./file-upload.md) |
| **Virtual** | Berechnet ein Feld aus anderen Feldern oder aus dem rohen `Request` | `@Virtual`, `@Request` | [Virtuelle Feld-Decorators](./virtual.md) |
| **Transform** | Ändert den Wert eines einzelnen Feldes vor dem Binden | `@Transform` | [Transformations-Decorator](./transforms.md) |
| **Validation** | Erzwingt Regeln für den Wert eines Feldes | `@Min`, `@Max`, `@Email`, `@OneOf`, … | [Validierungs-Decorators](./validators.md) |
| **Missing-value** | Entscheidet, was passiert, wenn ein Feld fehlt | `@Default`, `@Optional` | [Umgang mit fehlenden Feldern](./missing-fields.md) |

Weitere Helfer werden unter **Erweiterte Nutzung** behandelt, z. B. [`@List`](../advanced/list-decorator.md) für typisierte Arrays und [`@Type`](../advanced/type-and-polymorphism.md) für verschachtelte und polymorphe Typen.

## Decorators kombinieren

Ein einzelnes Feld kann Decorators aus mehreren Kategorien tragen. Sie werden zusammen gelesen, um dieses Feld zu binden, zu transformieren und zu validieren:

```typescript
import { Body, Transform, MinLength } from 'express-cargo'

class CreateUserRequest {
    @Body('email')                              // Source: aus req.body.email lesen
    @Transform((value: string) => value.trim()) // Transform: den Wert normalisieren
    @MinLength(5)                               // Validation: eine Regel erzwingen
    email!: string
}
```

Jede Kategorie wird auf ihrer eigenen, oben verlinkten Seite dokumentiert.
