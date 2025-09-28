# Default Field Decorator

Express-Cargo provides decorators to define default values for request fields. The decorator automatically assigns a value when the incoming request does not provide one (undefined or null).

## Built-in Default Decorator

### `@defaultValue(value: T)`

The @defaultValue decorator assigns a default value to a class property when the request does not provide it.

- **`value`**: The default value to assign if the field is not present in the request.

```typescript
class Request {
    @body()
    @defaultValue(1)
    price!: number;
}
```