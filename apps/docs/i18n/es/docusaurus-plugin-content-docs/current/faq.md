---
title: Preguntas frecuentes
sidebar_label: Preguntas frecuentes
---

Encuentra respuestas a preguntas comunes sobre el uso de la biblioteca. Haz clic en una pregunta para mostrar la respuesta.

### 1. Primeros pasos

<details>
<summary><b>P: ¿Qué es el proyecto express-cargo?</b></summary>

**R:** Es un middleware diseñado para automatizar el procesamiento repetitivo y tedioso de datos de solicitudes (`req.body`, `req.query`, etc.) en Express.js usando un enfoque basado en clases. Al utilizar decoradores de TypeScript, puedes manejar el enlace de datos y la validación de forma declarativa en un solo lugar.
</details>

<details>
<summary><b>P: ¿Hay precauciones para la instalación?</b></summary>

**R:** Se recomienda **Node.js versión 20 o superior**. Está diseñado para integrarse de forma flexible en proyectos Express existentes como middleware estándar.
</details>

<details>
<summary><b>P: ¿La configuración de TypeScript es obligatoria?</b></summary>

**R:** Sí. Como usa decoradores, las siguientes dos opciones deben establecerse en `true` en tu `tsconfig.json`:
- `experimentalDecorators: true`
- `emitDecoratorMetadata: true`

Además, el paquete `reflect-metadata` debe estar instalado para leer información de tipos en tiempo de ejecución.
</details>

### 2. Enlace de datos y decoradores

<details>
<summary><b>P: ¿Cuál es la diferencia entre `@Body` y `@Query`?</b></summary>

**R:** La diferencia está en la fuente de extracción de los datos:
- **`@Body`**: Extrae datos del cuerpo de la solicitud HTTP. Se usa principalmente para solicitudes `POST` y `PUT`.
- **`@Query`**: Extrae parámetros de la cadena de consulta de la URL (por ejemplo, `?id=1&name=test`). Se usa principalmente para filtrado u ordenamiento en solicitudes `GET`.
- También puedes enlazar otros datos de la solicitud usando `@Params()` (o `@Uri()`), `@Header()` y `@Session()`.
</details>

<details>
<summary><b>P: ¿Qué es @Uri()? ¿Es diferente de @Params()?</b></summary>

**R:** `@Uri()` es un **alias** de `@Params()`. Puedes elegir entre ellos según tu preferencia de legibilidad al enlazar parámetros de ruta de URL (por ejemplo, `/:id`).
</details>

<details>
<summary><b>P: ¿Cómo recupero los datos enlazados?</b></summary>

**R:** Después de pasar el middleware `bindingCargo(ClassName)` en tu router, puedes recuperar la instancia dentro del handler llamando a la función `getCargo<ClassName>(req)`.
</details>

### 3. Validación y transformación

<details>
<summary><b>P: ¿Cómo se manejan los fallos de validación?</b></summary>

**R:** La validación se realiza internamente usando decoradores como `@Min`, `@Max` y `@Length`. Si se detectan datos inválidos, el middleware devuelve automáticamente una respuesta de error o lanza una excepción.
</details>

<details>
<summary><b>P: ¿Cómo puedo procesar o transformar valores de campos?</b></summary>

**R:** Usa el decorador **`@Transform()`**. Por ejemplo, escribir `@Transform(v => v.trim())` te permite transformar los datos de entrada al formato deseado antes del enlace.
</details>

<details>
<summary><b>P: ¿Cómo evito errores si falta un campo específico?</b></summary>

**R:** Usa el decorador **`@Optional()`**. El campo se enlazará correctamente aunque el valor sea `null` o `undefined`, omitiendo la validación para ese campo.
</details>

### 4. Compatibilidad con frameworks

<details>
<summary><b>P: ¿Puedo usarlo con Fastify o NestJS?</b></summary>

**R:** Esta biblioteca está diseñada específicamente como **middleware exclusivo para Express.js**.
- **NestJS**: NestJS tiene su propio `ValidationPipe` y decoradores, que pueden solaparse en funcionalidad. Aunque técnicamente es posible si se usa el adaptador Express, el objetivo principal de esta biblioteca es mejorar la experiencia de desarrollo en entornos Express puros.
- **Fastify**: Actualmente no está soportado oficialmente.
</details>

### 5. Resolución de problemas

<details>
<summary><b>P: ¿Por qué los datos de mi instancia de clase devuelven `undefined`?</b></summary>

**R:** Revisa estos dos puntos:
- ¿Un middleware de análisis del body como `express.json()` está declarado **antes** de `bindingCargo`?
- ¿`reflect-metadata` está importado al principio del punto de entrada de tu aplicación?
</details>

<details>
<summary><b>P: ¿Se realiza conversión automática de tipos?</b></summary>

**R:** Sí. Intenta convertir los valores automáticamente según los tipos definidos en los campos de la clase (`string`, `number`, `boolean`, etc.). Por ejemplo, una cadena `"123"` proveniente de `@Query()` se convertirá automáticamente a número si el tipo del campo está definido como `number`.
</details>

### 6. Miscelánea

<details>
<summary><b>P: ¿Puedo usarlo gratis en proyectos comerciales?</b></summary>

**R:** Esta biblioteca está licenciada bajo la **Licencia MIT**. Puedes usarla, modificarla y distribuirla incluso con fines comerciales sin restricciones.
</details>
