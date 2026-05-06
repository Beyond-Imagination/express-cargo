## 🚀 Primeros pasos con express-cargo
Este documento proporciona una guía de configuración mínima para **probar rápidamente express-cargo en un entorno TypeScript + Express**.
Los ejemplos se basan en **pnpm + Node.js 18 o posterior**.

---

### 1. Requisitos

- Node.js **18 o posterior (se recomienda LTS)**

Administrador de paquetes: npm | yarn | pnpm
→ Este documento usa pnpm.

> Como express-cargo usa decoradores + metadatos, se recomienda TypeScript.

---

### 2. Instalación de Node.js
Instala la versión LTS adecuada para tu sistema operativo desde el sitio web oficial.

- Descarga oficial de Node.js
    https://nodejs.org


Verifica la instalación:
```shell
node -v
pnpm -v
```
Si se instaló correctamente, se mostrará la versión.

---

### 3. Crear un nuevo proyecto (pnpm)
#### pnpm
```shell
mkdir express-cargo-example
cd express-cargo-example
pnpm init
```

### 4. Configurar el entorno TypeScript
#### 4-1. Instalar TypeScript y dependencias de desarrollo
```shell
pnpm add -D typescript ts-node @types/node
```

#### 4-2. Crear tsconfig.json
```shell
pnpm tsc --init
```
#### 4-3. Configuración recomendada de tsconfig
```json
{
  "compilerOptions": {
    ...,
    "experimentalDecorators": true,     // requerido por express-cargo
    "emitDecoratorMetadata": true,      // usa metadatos de tipo
    ...
  },
  ...
}
```

>⚠️ Sin `experimentalDecorators` y `emitDecoratorMetadata`,
> la validación/transformación en express-cargo no funcionará.

---

### 5. Instalar express y express-cargo
```shell
pnpm add express express-cargo
pnpm add -D @types/express
pnpm add reflect-metadata
```

---

### 6. Servidor básico + configuración de express-cargo
#### 6-1. `src/app.ts`

```typescript
import express from 'express'
import { bindingCargo, getCargo, Body, Query, Header, Params, Min, Max, Equal, NotEqual, Prefix, Suffix } from 'express-cargo'
import errorHandlerRouter from './errorHandler'

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(errorHandlerRouter)

app.listen(port, () => {console.log(`Aplicación de ejemplo escuchando en el puerto ${port}`)})

class ExampleRequest {
  @Body() // Extrae campos del cuerpo de la solicitud
  @Equal('1') // Si el valor no es "1", se produce un error de validación
  id!: string
}

app.post('/example', bindingCargo(ExampleRequest), (req, res) => { // bindingCargo(Class): conversión Request → DTO + validación
  const cargo = getCargo<ExampleRequest>(req) // Devuelve un objeto validado y con seguridad de tipos
  res.json(cargo)
})
```

### 7. Ejecutar
```shell
npm run dev
```
Solicitud de prueba:

```
POST http://localhost:3000/example
Content-Type: application/json

{
  "id": "1"
}

```

Respuesta:

```
{ "id": "1" }
```

- ❌ `"id": "2"` → se produce un error de validación
