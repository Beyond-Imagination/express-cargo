# Enlace de objetos anidados

Express-Cargo te permite manejar objetos anidados en las solicitudes y enlazarlos automáticamente a objetos anidados, con soporte para conversión de tipos y validación recursivas.

## Ejemplo de uso

```typescript
import express, { Request, Response } from 'express'
import { Body, bindingCargo, getCargo } from 'express-cargo'

// 1. Define el objeto anidado
class Profile {
    @Body('nickname')
    nickname!: string
}

class ExampleObject {
    @Body('profile')
    profile!: Profile
}

// 2. Configura la aplicación Express y la ruta
const app = express()
app.use(express.json())

app.post('/submit', bindingCargo(ExampleObject), (req: Request, res: Response) => {
    const requestData = getCargo<ExampleObject>(req)

    res.json({
        message: 'Objeto anidado enlazado correctamente!',
        data: requestData,
    })
})

/*
Para probar este endpoint, envía una solicitud POST a /submit.

URL de solicitud de ejemplo:
http://localhost:3000/submit
*/
```

## Ejemplo de salida

Cuando se envía una solicitud POST con un objeto `profile` anidado, el middleware `bindingCargo` instancia y valida automáticamente el `ExampleObject` anidado. Después, la función `getCargo` devuelve un objeto completamente relleno con los datos anidados:

```json
{
    "message": "Objeto anidado enlazado correctamente!",
    "data": {
        "profile": {
            "nickname": "coder123"
        }
    }
}
```
