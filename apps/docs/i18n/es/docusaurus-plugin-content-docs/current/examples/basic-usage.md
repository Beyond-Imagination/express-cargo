# Uso básico

Este ejemplo muestra el flujo de extremo a extremo más simple de **express-cargo**: definir una clase de solicitud, enlazarla con el middleware `bindingCargo` y leer el resultado validado con `getCargo`.

> Esta página se centra solo en el flujo de enlace. Para la configuración del proyecto (TypeScript, `tsconfig`, instalación de dependencias), consulta [Primeros pasos](../getting-started.md).

## 1. Definir una clase de solicitud

Declara una clase y usa un decorador de origen (aquí `@Body()`) para asignar cada campo a una parte de la solicitud entrante.

```typescript
// create-user.request.ts
import { Body } from 'express-cargo'

export class CreateUserRequest {
    @Body('name')
    name!: string

    @Body('email')
    email!: string
}
```

## 2. Aplicar el middleware

Pasa la clase de solicitud a `bindingCargo` y regístralo como middleware en la ruta. El middleware enlaza y valida la solicitud antes de que se ejecute tu manejador.

```typescript
import express from 'express'
import { bindingCargo, getCargo } from 'express-cargo'
import { CreateUserRequest } from './create-user.request'

const app = express()
app.use(express.json())

app.post('/users', bindingCargo(CreateUserRequest), (req, res) => {
    // 3. Leer el objeto enlazado con seguridad de tipos
    const user = getCargo<CreateUserRequest>(req)

    res.json({
        message: 'User created!',
        data: user,
    })
})
```

## 3. Solicitud de ejemplo

```json
{
    "name": "Jane Doe",
    "email": "jane@example.com"
}
```

## 4. Resultado de ejemplo

`getCargo<CreateUserRequest>(req)` devuelve una instancia completamente poblada de `CreateUserRequest`:

```json
{
    "message": "User created!",
    "data": {
        "name": "Jane Doe",
        "email": "jane@example.com"
    }
}
```

## Próximos pasos

- Obtener datos de otras fuentes (`@Query`, `@Header`, `@Params`) — consulta [Decoradores de origen](../decorators/source-decorators.md)
- Agregar reglas de validación como `@Min`, `@Email` — consulta [Decoradores de validación](../decorators/validators.md)
- Enlazar objetos anidados — consulta [Manejo de solicitudes anidadas](./nested-request.md)
- Manejar fallos de validación — consulta [Manejo de errores](./validation-errors.md)
