# Decorador de campo predeterminado

Express-Cargo proporciona decoradores para definir valores predeterminados en los campos de una solicitud. El decorador asigna automáticamente un valor cuando la solicitud entrante no proporciona uno (`undefined` o `null`).

## Decorador predeterminado integrado

### `@Default(value: T)`

El decorador `@Default` asigna un valor predeterminado a una propiedad de clase cuando la solicitud no la proporciona.

- **`value`**: El valor predeterminado que se asignará si el campo no está presente en la solicitud.

```typescript
class Request {
    @Body()
    @Default(1)
    price!: number;
}
```
