# Decoradores de validación

Express-Cargo usa decoradores para validar datos entrantes de solicitudes que se enlazan a una clase.

La validación no se realiza mediante una función `validate` independiente. En cambio, está integrada en el middleware `bindingCargo`, que valida automáticamente los datos durante el ciclo de vida de la solicitud.

## Validadores integrados

### `@Optional()`

Marca un campo como opcional, permitiendo que se omita o se establezca como `undefined` sin provocar errores de validación.

### `@Min(value: number)`

Valida que un número sea mayor o igual que el valor mínimo especificado.

- **`value`**: El valor mínimo permitido.

### `@Max(value: number)`

Valida que un número sea menor o igual que el valor máximo especificado.

- **`value`**: El valor máximo permitido.

### `@Range(min: number, max: number)`

Valida que un número esté dentro del rango especificado, incluyendo los valores mínimo y máximo.

- **`min`**: El valor mínimo permitido.
- **`max`**: El valor máximo permitido.

### `@Contains(seed: string)`

Valida que la cadena contenga la subcadena especificada.

- **`seed`**: La subcadena que debe estar presente en la cadena.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@Prefix(value: string)`

Valida que una cadena empiece con el prefijo especificado.

- **`value`**: El texto inicial requerido.

### `@Suffix(value: string)`

Valida que una cadena termine con el sufijo especificado.

- **`value`**: El texto final requerido.

### `@Equal(value: any)`

Valida que un valor sea estrictamente igual (`===`) al valor especificado.

- **`value`**: El valor contra el cual comparar.

### `@NotEqual(value: any)`

Valida que un valor no sea estrictamente igual (`!==`) al valor especificado.

- **`value`**: El valor contra el cual comparar.

### `@IsTrue()`

Valida que la propiedad decorada sea `true`.

### `@IsFalse()`

Valida que la propiedad decorada sea `false`.

### `@Length(value: number)`

Valida que la longitud de la cadena decorada sea exactamente el valor especificado.

- **`value`**: La longitud exacta requerida en caracteres.

### `@MaxLength(value: number)`

Valida que la longitud de la cadena decorada no supere el máximo especificado.

- **`value`**: La longitud máxima permitida en caracteres.

### `@MinLength(value: number)`

Valida que la longitud de la cadena decorada sea al menos el mínimo especificado.

- **`value`**: La longitud mínima permitida en caracteres.

### `@OneOf(values: any[])`

Valida que el valor de entrada sea uno de los valores especificados.

- **`values`**: El array de valores permitidos.

### `@ListContains(values: any[], comparator?: (expected, actual) => boolean, message?: string)`

Valida que el array contenga todos los valores especificados. Soporta valores primitivos, objetos, `Date` y tipos mixtos.

- **`values`**: Los valores que deben estar presentes en el array.
- **`comparator`** (opcional): Una función de comparación personalizada `(expected, actual) => boolean`. Cuando se proporciona, todas las comparaciones se delegan a esta función, incluidas las de primitivos.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

> **Advertencia**: La comparación de objetos usa igualdad profunda de forma predeterminada. El rendimiento puede degradarse cuando `values` contiene muchos objetos o estructuras profundamente anidadas. Considera usar un `comparator` para una comparación más eficiente o flexible.

### `@ListNotContains(values: any[], comparator?: (expected, actual) => boolean, message?: string)`

Valida que el array NO contenga ninguno de los valores especificados. Soporta valores primitivos, objetos, `Date` y tipos mixtos.

- **`values`**: Los valores que NO deben estar presentes en el array.
- **`comparator`** (opcional): Una función de comparación personalizada `(expected, actual) => boolean`. Cuando se proporciona, todas las comparaciones se delegan a esta función, incluidas las de primitivos.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

> **Advertencia**: La comparación de objetos usa igualdad profunda de forma predeterminada. El rendimiento puede degradarse cuando `values` contiene muchos objetos o estructuras profundamente anidadas. Considera usar un `comparator` para una comparación más eficiente o flexible.

### `@Enum(enumObj: object, message?: string)`

Valida que el valor de entrada coincida con uno de los valores del objeto enum especificado.
También transforma automáticamente el valor de entrada (por ejemplo, una clave de cadena) al valor correspondiente del enum.

- **`enumObj`**: El objeto enum contra el cual validar.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@Validate(validateFn: (value: unknown) => boolean, message?: string)`

Valida un valor usando una función de validación personalizada.
Este decorador proporciona flexibilidad para implementar lógica de validación más allá de los validadores integrados.

- **`validateFn`**: Una función que recibe el valor del campo y devuelve `true` si es válido o `false` en caso contrario.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@Regexp(pattern: RegExp, message?: string)`

Valida que el campo decorado coincida con el patrón de expresión regular especificado.
Este decorador es útil para imponer reglas de formato como correo electrónico, números de teléfono, etc.

- **`pattern`**: Un objeto `RegExp` usado para probar el valor del campo. El valor es válido si coincide con el patrón.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@Email()`

Valida que la propiedad decorada sea una dirección de correo electrónico válida.

### `@Alpha(message?: string)`

Valida que el campo decorado contenga solo caracteres alfabéticos (letras inglesas mayúsculas o minúsculas, A–Z / a–z).

- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@Uuid(version?: 'v1' | 'v3' | 'v4' | 'v5', message?: string)`

Valida que el campo decorado sea una cadena UUID válida, opcionalmente restringida a una versión específica (v1, v3, v4 o v5).

- **`version`** (opcional): La versión UUID específica contra la cual validar. Si se omite, valida contra v1, v3, v4 o v5.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@Alphanumeric(message?: string)`

Valida que el campo decorado contenga solo caracteres alfanuméricos (letras inglesas y dígitos, A–Z, a–z, 0–9).

- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@IsUppercase(message?: string)`

Valida que el campo decorado contenga solo caracteres en mayúsculas.

- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@IsLowercase(message?: string)`

Valida que el campo decorado contenga solo caracteres en minúsculas.

- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@IsJwt(message?: string)`

Valida que el campo decorado siga el formato JWT (`header.payload.signature`). Cada parte debe consistir en caracteres Base64URL (A-Z, a-z, 0-9, `-`, `_`). Este decorador solo comprueba el formato; no verifica la firma ni la validez del token.

- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@IsUrl(options?: IsUrlOptions, message?: string)`

Valida que el campo decorado sea una URL válida. De forma predeterminada, se permiten los protocolos `http`, `https` y `ftp`.

- **`options`** (opcional):
  - **`protocols`**: Un array de protocolos permitidos. El valor predeterminado es `['http', 'https', 'ftp']`.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@IsPhoneNumber(region?: CountryCode, message?: string)`

Valida que el campo decorado sea un número telefónico válido. Usa [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) para una validación precisa en todos los países.

Cuando se proporciona una región, se aceptan formatos locales (sin código de país). Cuando no se proporciona región, el número debe incluir un código de país (por ejemplo, `+82`). Si el número incluye un prefijo `+` con código de país, se ignora el parámetro de región y el número se valida contra su propio código de país.

- **`region`** (opcional): Código de región ISO 3166-1 alpha-2 (por ejemplo, `'KR'`, `'US'`). Si se omite, el número debe estar en formato internacional.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@IsTimeZone(message?: string)`

Valida que el campo decorado sea un identificador de zona horaria IANA válido (por ejemplo, `Asia/Seoul`, `America/New_York`, `UTC`). Usa la API integrada `Intl` para la validación; no requiere dependencias externas.

- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@IsHexColor(message?: string)`

Valida que el campo decorado sea un código de color hexadecimal válido. Soporta los formatos `#RGB`, `#RGBA`, `#RRGGBB` y `#RRGGBBAA` (sin distinguir mayúsculas/minúsculas). El prefijo `#` es obligatorio.

- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@IsHexadecimal(message?: string)`

Valida que el campo decorado sea un número hexadecimal. El valor debe contener solo caracteres `0-9` y `a-f` (sin distinguir mayúsculas/minúsculas). También se permite el prefijo `0x`.

- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@IsHash(algorithm: HashAlgorithm, message?: string)`

Valida que el campo decorado sea una cadena hash válida para el algoritmo indicado. Algoritmos soportados: `md5`, `sha1`, `sha256`, `sha384`, `sha512`, `crc32`, `crc32b`. El valor debe ser una cadena hexadecimal con la longitud exacta requerida por el algoritmo.

- **`algorithm`**: El algoritmo hash contra el cual validar.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@MinDate(min: Date | (() => Date), message?: string)`

Valida que el campo decorado sea un `Date` igual o posterior a la fecha mínima indicada. Acepta un `Date` fijo o una función que devuelve un `Date` para comparación dinámica.

- **`min`**: La fecha mínima permitida, o una función que la devuelve.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@MaxDate(max: Date | (() => Date), message?: string)`

Valida que el campo decorado sea un `Date` igual o anterior a la fecha máxima indicada. Acepta un `Date` fijo o una función que devuelve un `Date` para comparación dinámica.

- **`max`**: La fecha máxima permitida, o una función que la devuelve.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@With(fieldName: string, message?: string)`

Valida que, si el campo decorado tiene un valor, el campo de destino especificado (`fieldName`) también deba tener un valor, estableciendo una dependencia obligatoria entre ambos campos.

- **`fieldName`**: El nombre del campo de destino que también debe tener un valor si el campo decorado tiene un valor.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@Without(fieldName: string, message?: string)`

Valida que, si la propiedad decorada tiene un valor, la propiedad de destino especificada NO deba tener un valor, estableciendo una relación mutuamente excluyente entre ambas propiedades.

- **`fieldName`**: El nombre de la propiedad de destino que debe estar vacía si el campo decorado tiene un valor.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@Each(...args: (Validator | Function)[])`

Valida cada elemento individual dentro de un array. Puede aceptar otros decoradores de validación o funciones de validación personalizadas.

- `args`: Un decorador de validación (por ejemplo, `@Min(5)`) o una función personalizada `(value: any) => boolean`.

### `@ListMaxSize(max: number, message?: string)`

Valida que el array no contenga más del número especificado de elementos.

- **`max`**: El número máximo de elementos permitidos en el array.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

### `@ListMinSize(min: number, message?: string)`

Valida que el array contenga al menos el número especificado de elementos.

- **`min`**: El número mínimo de elementos permitidos en el array.
- **`message`** (opcional): El mensaje de error que se mostrará cuando falle la validación. Si se omite, se usará un mensaje predeterminado.

## Ejemplo de uso

Este es un ejemplo completo de cómo usar decoradores de validación dentro de una aplicación Express.

```typescript
import express, { Request, Response, NextFunction } from 'express'
import { bindingCargo, getCargo, Body, Min, Max, Suffix, CargoValidationError } from 'express-cargo'

// 1. Define una clase con reglas de fuente y validación
class CreateAssetRequest {
    @Body('name')
    assetName!: string

    @Body('type')
    @Suffix('.png')
    assetType!: string

    @Body('quantity')
    @Min(1)
    @Max(100)
    quantity!: number
}

const app = express()
app.use(express.json())

// 2. Aplica el middleware bindingCargo a una ruta
app.post('/assets', bindingCargo(CreateAssetRequest), (req: Request, res: Response) => {
    // 3. Si la validación es correcta, accede a los datos con getCargo
    const assetData = getCargo<CreateAssetRequest>(req)
    res.json({
        message: 'Recurso creado correctamente!',
        data: assetData,
    })
})

// 4. Añade un middleware de manejo de errores para capturar errores de validación
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        res.status(400).json({
            message: 'La validación falló',
            errors: err.errors.map(e => e.message),
        })
    } else {
        next(err)
    }
})

/*
Para probar este endpoint, envía una solicitud POST a /assets.

Ejemplo de cuerpo de solicitud VÁLIDO:
{
    "name": "My-Asset",
    "type": "icon.png",
    "quantity": 10
}

Ejemplo de cuerpo de solicitud INVÁLIDO:
{
    "name": "My-Asset",
    "type": "icon.jpg", // Falla por @Suffix('.png')
    "quantity": 101     // Falla por @Max(100)
}
*/
```

## Manejo de errores

Cuando la validación falla, el middleware `bindingCargo` lanza un `CargoValidationError`. Debes registrar un middleware de manejo de errores de Express para capturar este error y dar formato a la respuesta.

El objeto `CargoValidationError` tiene una propiedad `errors`, que contiene un array de instancias `CargoFieldError`. Cada objeto `CargoFieldError` contiene una propiedad `message` con una cadena formateada que detalla el error específico (por ejemplo, `"quantity: quantity must be <= 100"`).

Como se muestra en el ejemplo de código, una forma común de manejarlo es recorrer el array `err.errors` para crear una lista simple de estos mensajes de error.

**Ejemplo de respuesta de error:**

Cuando se envía el cuerpo de solicitud inválido del ejemplo anterior, el middleware de errores producirá la siguiente respuesta JSON, que contiene un array de mensajes de error formateados.

```json
{
    "message": "La validación falló",
    "errors": [
        "type: assetType must end with .png",
        "quantity: quantity must be <= 100"
    ]
}
```
