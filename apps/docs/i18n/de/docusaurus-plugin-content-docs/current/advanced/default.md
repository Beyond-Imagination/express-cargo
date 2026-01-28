# Standardwert-Feld-Decorator

Express-Cargo bietet Decorators zur Definition von Standardwerten für Anfragefelder. Der Decorator weist automatisch einen Wert zu, wenn die eingehende Anfrage keinen bereitstellt (undefined oder null).

## Integrierter Standardwert-Decorator

### `@Default(value: T)`

Der @Default-Decorator weist einer Klasseneigenschaft einen Standardwert zu, wenn die Anfrage diesen nicht bereitstellt.

- **`value`**: Der Standardwert, der zugewiesen wird, wenn das Feld in der Anfrage nicht vorhanden ist.

```typescript
class Request {
    @Body()
    @Default(1)
    price!: number;
}
```
