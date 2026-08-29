# Typ-Helfer-Decorators

Typ-Helfer teilen dem Binder mit, **wie der Wert eines Feldes zu interpretieren ist**, bevor die Validierung läuft. Sie entscheiden, zu welcher Klasse ein verschachteltes Objekt wird, in welchen Typ jedes Array-Element umgewandelt wird und auf welches Enum-Mitglied eine rohe Zeichenkette abgebildet wird.

`@Type`, `@List` und `@Enum` bilden eine einzige Kategorie. Auf ein Feld darf höchstens einer von ihnen angewendet werden.

## `@Type(typeFn: TypeThunk | TypeResolver, options?: TypeOptions)`

Wandelt ein einfaches JSON-Objekt in eine Instanz der Zielklasse um.

- **`typeFn`**: Eine Funktion, die die Zielklasse zurückgibt. Verwenden Sie einen Thunk `() => Class` für einen festen Typ oder einen Resolver `(data) => Class`, um die Klasse anhand der Rohdaten zu wählen.
- **`options.discriminator`** (optional): Strukturelle Zuordnung der Form `{ property, subTypes: [{ name, value }] }`. Die Klasse wird anhand des Werts von `property` ausgewählt.

`@Type` kann nicht auf ein `String`-, `Number`- oder `Boolean`-Feld angewendet werden.

```typescript
class User {
    @Body()
    @Type(() => Profile)
    profile!: Profile
}
```

Siehe [Typumwandlung & Polymorphie](../advanced/type-and-polymorphism.md) für verschachtelte Zuordnungen, zirkuläre Referenzen und dynamische Auflösung.

## `@List(elementType: ArrayElementType)`

Deklariert den Elementtyp eines Array-Feldes, sodass jedes Element einzeln umgewandelt wird.

- **`elementType`**: `String`, `Number`, `Boolean`, `Date`, ein Klassenkonstruktor oder eines der String-Literale `'string'`, `'number'`, `'boolean'`, `'date'`.

`@List` kann nur auf Array-Felder angewendet werden.

```typescript
class ListSample {
    @Body()
    @List(Number)
    scores!: number[]
}
```

Ein vollständiges Beispiel finden Sie unter [List-Decorator](../advanced/list-decorator.md).

## `@Enum(enumObj: object, message?: string)`

Bildet den eingehenden Wert auf ein Mitglied von `enumObj` ab und lehnt einen Wert ab, der kein Mitglied ist.

- **`enumObj`**: Das Enum-Objekt, auf das abgebildet wird.
- **`message`** (optional): Die Fehlermeldung, die angezeigt wird, wenn der Wert kein Mitglied ist. Wenn weggelassen, wird eine Standardmeldung verwendet.

Sowohl der Enum-Schlüssel (`'ADMIN'`) als auch der Enum-Wert (`'admin'`, `0`) werden als Eingabe akzeptiert, und das gebundene Feld enthält immer den Enum-Wert. Eine numerische Zeichenkette wird numerisch verglichen, sodass `'0'` auf das Mitglied mit dem Wert `0` passt.

```typescript
enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

class UpdateRoleRequest {
    @Body('role')
    @Enum(UserRole)
    role!: UserRole
}
```

`@Enum` wandelt den Wert um und prüft ihn, ist aber ein **Typ-Helfer** und kein [Validierungs-Decorator](./validators.md). Daraus folgen zwei Dinge:

- `@Each` umschließt ausschließlich Validierungs-Decorators, daher wird `@Each(Enum(UserRole))` abgelehnt.
- `@Enum` installiert seinen eigenen Transformer und kann deshalb nicht mit `@Transform` kombiniert werden.

## Schema-Regeln

`bindingCargo()` prüft die folgenden Regeln bei der Registrierung der Route, nicht bei der ersten Anfrage. Ein Verstoß wirft beim Start `CargoSchemaError`.

| Regel                                      | Verletzungsmeldung                                                             |
|--------------------------------------------|--------------------------------------------------------------------------------|
| Nur ein Typ-Helfer pro Feld                | `@List + @Type cannot be combined; apply a single one of @Type/@List/@Enum`    |
| `@List` erfordert ein Array-Feld           | `@List can only be applied to array fields`                                    |
| `@Type` lehnt ein primitives Feld ab       | `@Type cannot be applied to a primitive field`                                 |
| `@Each` kann keinen Typ-Helfer umschließen | `@Each cannot wrap type-helper decorator(s): @Enum`                            |
| `@Enum` besitzt den Transformer            | `@Enum cannot be combined with @Transform; @Enum installs its own transformer` |

Eine Meldung nennt die tatsächlich angewendeten Decorators in der Auswertungsreihenfolge (von unten nach oben); der vordere Teil hängt also von Ihrem Code ab.
