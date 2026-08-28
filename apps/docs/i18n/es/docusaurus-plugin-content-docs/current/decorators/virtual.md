# Decoradores de campos virtuales

**Express-Cargo** proporciona decoradores para definir **campos virtuales** y **campos derivados de la solicitud**. Estos decoradores te permiten calcular valores dinámicamente o asignar datos directamente desde el `Request` a una propiedad del objeto.

## Decoradores virtuales integrados

### `@Virtual<T>(transformer: (obj: object) => T)`

El decorador `@Virtual` define una **propiedad calculada** que no proviene directamente de la solicitud. En su lugar, su valor se deriva de otras propiedades del objeto.

- **`transformer`**: Una función que recibe la instancia del objeto y devuelve el valor calculado.

### `@Request<T>(transformer: (req: Request) => T)`

El decorador `@Request` asigna un valor desde el objeto `Request` de Express a una propiedad de clase.

- **`transformer`**: Una función que recibe el objeto Request y devuelve el valor que se enlazará.

`@Request` asigna el valor devuelto tal cual, sin aplicar la conversión de tipos integrada. Un caso de uso habitual es enlazar el usuario que un middleware de autenticación, como Passport.js, ha establecido en `req.user`.

## Cómo elegir entre ambos

`@Virtual` y `@Request` pertenecen a dos categorías distintas, y un campo admite exactamente uno de ellos. Aplicar ambos provoca `@Request cannot be combined with @Virtual` al registrar la ruta, y combinar cualquiera de ellos con un decorador de origen como `@Body` se rechaza igual: los tres responden a la misma pregunta de dónde viene el valor de un campo.

- Usa `@Request` cuando el valor está en el objeto `Request` sin procesar, antes de que se enlace ninguno de los campos propios del objeto.
- Usa `@Virtual` cuando el valor se deriva de otros campos del objeto que se está construyendo.

`@Virtual` se ejecuta después de enlazar todos los campos de origen, así que puede leerlos sin importar en qué orden estén declarados. Solo un campo `@Virtual` que depende de otro campo `@Virtual` es sensible al orden.

## Ejemplo de uso

```typescript
import express from 'express'
import passport from 'passport'
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { Body, Virtual, Request, bindingCargo, getCargo } from 'express-cargo'

class OrderExample {
    @Body('price')
    price!: number

    @Body('quantity')
    quantity!: number

    // Campo calculado que no está presente en la solicitud
    @Virtual((obj: OrderExample) => obj.price * obj.quantity)
    total!: number
}

class PassportExample {
    @Request<object>(req => req.user!)
    user!: object
}

const EXAMPLE_TOKEN = 'express-cargo-token'

passport.use(
    new BearerStrategy((token, done) => {
        if (token !== EXAMPLE_TOKEN) {
            return done(null, false)
        }

        return done(null, { id: 'test-user-id', role: 'admin' })
    }),
)

const app = express()
app.use(express.json())
app.use(passport.initialize())

app.post('/orders', bindingCargo(OrderExample), (req, res) => {
    const orderData = getCargo<OrderExample>(req)
    res.json({
        message: 'Datos del pedido procesados con campos virtuales!',
        data: orderData,
    })
})

app.get('/passport', passport.authenticate('bearer', { session: false }), bindingCargo(PassportExample), (req, res) => {
    const cargo = getCargo<PassportExample>(req)
    res.json(cargo)
})
```

La autenticación de Passport debe ejecutarse antes de `bindingCargo()`. Cuando la autenticación tiene éxito, Passport establece `req.user` y `@Request<object>` enlaza ese objeto a `PassportExample.user`. Passport rechaza las credenciales ausentes o no válidas antes de que se ejecute el enlace de cargo.

```shell
curl 'http://localhost:3000/passport' \
    -H 'Authorization: Bearer express-cargo-token'
```

```json
{
    "user": {
        "id": "test-user-id",
        "role": "admin"
    }
}
```

El uso de `object` mantiene el ejemplo independiente del modelo de usuario de la aplicación. Si el código necesita acceder a propiedades como `user.id`, sustituye `object` por un tipo de usuario concreto y pásalo a `@Request<T>`.
