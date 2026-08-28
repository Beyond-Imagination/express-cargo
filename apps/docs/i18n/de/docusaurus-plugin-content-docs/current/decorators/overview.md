# Decorators-Übersicht

## Was sind Decorators?
Decorators in express-cargo annotieren Klassenfelder, um der Middleware mitzuteilen:

- Woher Daten extrahiert werden sollen (z. B. Body, Query)
- Wie sie validiert werden sollen
- Wie sie transformiert werden sollen

Wenn Sie eine Klasse an `bindingCargo` übergeben, liest die Middleware diese Decorators, um ein typsicheres Objekt zu erstellen, zu validieren und zu transformieren, das Sie mit `getCargo` abrufen.

## Decorator-Kategorien

Decorators werden nach der Rolle gruppiert, die sie in der Binding-Pipeline spielen.

| Kategorie         | Zweck                                                        | Beispiele                                                                                       | Referenz                                                                                 |
|-------------------|--------------------------------------------------------------|-------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| **Source**        | Bestimmt, woher der Wert eines Feldes stammt                 | `@Body`, `@Query`, `@Header`, `@Uri` / `@Params`, `@Session`, `@UploadedFile`, `@UploadedFiles` | [Source-Decorators](./source-decorators.md), [Datei-Upload-Decorators](./file-upload.md) |
| **Request**       | Liest einen Wert direkt aus dem Express-`Request`            | `@Request`                                                                                      | [Virtuelle Feld-Decorators](./virtual.md)                                                |
| **Virtual**       | Berechnet ein Feld aus den anderen Feldern des Objekts       | `@Virtual`                                                                                      | [Virtuelle Feld-Decorators](./virtual.md)                                                |
| **Transform**     | Ändert den Wert eines einzelnen Feldes vor dem Binden        | `@Transform`                                                                                    | [Transformations-Decorator](./transforms.md)                                             |
| **Typ-Helfer**    | Bestimmt, wie ein Rohwert interpretiert und umgewandelt wird | `@Type`, `@List`, `@Enum`                                                                       | [Typ-Helfer-Decorators](./type-helpers.md)                                               |
| **Validation**    | Erzwingt Regeln für den Wert eines Feldes                    | `@Min`, `@Max`, `@Email`, `@OneOf`, …                                                           | [Validierungs-Decorators](./validators.md)                                               |
| **Missing-value** | Entscheidet, was passiert, wenn ein Feld fehlt               | `@Default`, `@Optional`                                                                         | [Umgang mit fehlenden Feldern](./missing-fields.md)                                      |

**Source**, **Request** und **Virtual** beantworten dieselbe Frage – woher stammt der Wert dieses Feldes? – deshalb muss jedes Feld genau einen davon tragen, und sie lassen sich nicht kombinieren. `@UploadedFile` und `@UploadedFiles` sind Source-Decorators, die die Ausgabe des Multipart-Parsers lesen; deshalb werden `@UploadedFile` und `@Body` an einem Feld genauso abgelehnt wie `@Body` und `@Query`.

Für die tiefergehenden `@Type`- und `@List`-Szenarien – Polymorphie, zirkuläre Referenzen, Arrays eigener Klassen – siehe [Typumwandlung & Polymorphie](../advanced/type-and-polymorphism.md) und [List-Decorator](../advanced/list-decorator.md) unter **Erweiterte Nutzung**.

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

Die Beschränkung gilt innerhalb einer Kategorie, nicht zwischen den Kategorien: Ein Feld nimmt eine Quelle, einen Typ-Helfer und eine Strategie für fehlende Werte, während Validierungs-Decorators beliebig gestapelt werden können. `bindingCargo()` prüft diese Regeln bei der Registrierung der Route und wirft `CargoSchemaError`, bevor der Server eine Anfrage bearbeitet.

Jede Kategorie wird auf ihrer eigenen, oben verlinkten Seite dokumentiert.
