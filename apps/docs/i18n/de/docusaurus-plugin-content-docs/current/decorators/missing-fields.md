# Umgang mit fehlenden Feldern

Wenn ein Feld **in der Anfrage fehlt** (sein Wert ist `undefined` oder `null`), muss Express-Cargo wissen, was zu tun ist. Zwei Decorators steuern dieses Verhalten:

- **`@Default(value)`** — setzt einen Ersatzwert ein.
- **`@Optional()`** — erlaubt, dass das Feld leer bleibt, ohne einen „required“-Fehler auszulösen.

Da beide dasselbe entscheiden — was passiert, wenn ein Feld fehlt — schließen sie sich **gegenseitig aus**. Beide auf dasselbe Feld anzuwenden, löst einen Schema-Fehler aus.

Hat ein Feld **keinen** der beiden Decorators und der Wert fehlt, schlägt die Bindung mit einem `<field> is required`-Validierungsfehler fehl.

## `@Default(value: T)`

Der `@Default`-Decorator weist einer Klasseneigenschaft einen Standardwert zu, wenn die Anfrage diesen nicht bereitstellt.

- **`value`**: Der Standardwert, der zugewiesen wird, wenn das Feld in der Anfrage nicht vorhanden ist.

```typescript
class Request {
    @Body()
    @Default(1)
    price!: number;
}
```

### Wann der Standardwert angewendet wird

Der Standardwert wird **nur angewendet, wenn der eingehende Wert `undefined` oder `null` ist** (d. h. das Feld fehlt in der Anfrage). Jeder andere aus der Anfrage stammende Wert bleibt unverändert.

Das bedeutet, dass falsy-Werte wie `0`, `''` und `false` als echte Eingabe behandelt werden und den Standardwert **nicht** auslösen:

```typescript
class Request {
    @Body()
    @Default(10)
    quantity!: number
}
```

| Eingehendes `quantity` | Gebundener Wert            |
|------------------------|----------------------------|
| fehlt / `undefined`    | `10` (Standard angewendet) |
| `null`                 | `10` (Standard angewendet) |
| `0`                    | `0` (beibehalten)          |
| `5`                    | `5` (beibehalten)          |

## `@Optional()`

Der `@Optional`-Decorator markiert ein Feld als optional, sodass es weggelassen oder auf `undefined`/`null` gesetzt werden kann, ohne einen „required“-Fehler auszulösen. Fehlt das Feld, bleibt es `null` und die Validierungsregeln für das Feld werden übersprungen.

```typescript
class Request {
    @Body()
    @Min(0)
    @Optional()
    discount?: number
}
```

Hier wird ein fehlendes `discount` an `null` gebunden und die Regel `@Min(0)` übersprungen. Wenn `discount` **doch** angegeben wird, wird es normal validiert.

## Wahl zwischen `@Default` und `@Optional`

| | Feld fehlt | Feld angegeben |
|---|---|---|
| `@Default(value)` | an `value` gebunden | Wert beibehalten und validiert |
| `@Optional()` | an `null` gebunden | Wert beibehalten und validiert |
| keiner | `<field> is required`-Fehler | Wert beibehalten und validiert |

Wählen Sie **eine** Strategie pro Feld:

```typescript
class Request {
    // ❌ Ungültig: ein Feld kann nur eine Strategie für fehlende Werte verwenden
    @Body()
    @Default(1)
    @Optional()
    price!: number
}
```
