# Vererbte Bindung

Feld-Decorators werden auch auf Felder angewendet, die in übergeordneten Klassen deklariert sind.  
So können Sie gemeinsame Felder einmal in einer **Basisklasse** definieren und sie über **Unterklassen** hinweg wiederverwenden.

## Beispiel
```typescript
class BaseRequest {
  @Body()
  @Length(10)
  id!: string
}

class CreateUserRequest extends BaseRequest {
  @Body()
  @OneOf(["admin", "user"])
  role!: string
}
```

## Ergebnis
`CreateUserRequest` wird die folgenden Felder haben:

- id : von `BaseRequest` geerbt

- role : in `CreateUserRequest` definiert

Wenn Sie `CreateUserRequest` an `bindingCargo` übergeben, werden sowohl das geerbte `id` als auch das lokal deklarierte `role` zusammen gebunden und validiert.

## Erneutes Deklarieren eines geerbten Feldes

Das erneute Deklarieren eines geerbten Feldes in einer Unterklasse ersetzt die Definition der übergeordneten Klasse **nicht** — die Decorators beider Klassen werden auf demselben Feld zusammengeführt. Wird ein Source-Decorator auf diese Weise erneut angewendet (zum Beispiel `@Body()` auf einem Feld, das die übergeordnete Klasse bereits mit `@Body()` bezieht), entsteht ein Schema-Fehler:

```
Update.id: @body + @body cannot be combined; pick a single source
```

Jedes Feld sollte also in einer einzigen Klasse deklariert werden. Um zu ändern, wie ein Feld gebunden oder validiert wird, bearbeiten Sie es dort, wo es ursprünglich deklariert ist, anstatt es in einer Unterklasse erneut zu deklarieren.

## Hinweise

- Felder werden über die gesamte Prototypenkette gesammelt, sodass mehrere Vererbungsebenen unterstützt werden.
