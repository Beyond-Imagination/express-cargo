# Introducción a express-cargo

## Visión general

express-cargo es una biblioteca de middleware ligera
diseñada para el desarrollo de aplicaciones web basadas en el framework Express.js.
Esta biblioteca aprovecha el patrón de decoradores para proporcionar enlace de datos de solicitudes basado en clases y funciones de validación.
Permite asignar automáticamente diversos formatos de datos recibidos mediante solicitudes HTTP (`Request`)
a clases definidas por el desarrollador,
y al mismo tiempo facilita una validación ágil de esos datos.

## ¿Por qué express-cargo?

Aunque Express.js ofrece una arquitectura flexible,
pueden surgir desafíos relacionados con tareas repetitivas y mantenimiento durante el procesamiento de datos de solicitudes.
express-cargo aborda estos desafíos de desarrollo,
mejorando así la eficiencia de desarrollo y la robustez del código.

### 1. Reducción de código repetitivo

- **Desafíos del enfoque tradicional**: En un entorno Express.js, extraer datos de `req.body`, `req.query`,
  `req.params`, `req.headers` e implementar repetidamente lógica de comprobación de tipos y validación en cada handler de ruta
  provoca duplicación de código y menor productividad.
- **Solución de express-cargo**: express-cargo utiliza decoradores para definir declarativamente la lógica de extracción y enlace de datos
  en clases de solicitud. Los desarrolladores pueden enfocarse en declarar las fuentes de datos, minimizando el procesamiento repetitivo
  y mejorando la productividad.

### 2. Mayor seguridad de tipos y legibilidad

- **Desafíos del enfoque tradicional**: En un entorno JavaScript, la fiabilidad de tipos de los datos de solicitud es baja,
  e incluso en TypeScript las aserciones manuales de tipos conllevan riesgo de errores en tiempo de ejecución. Además, la mezcla de
  lógica de procesamiento de datos y lógica de negocio suele perjudicar la legibilidad del código.
- **Solución de express-cargo**: Al realizar enlace automático de datos y conversión de tipos según los tipos declarados en las
  clases de solicitud, express-cargo permite detectar errores de tipo durante la compilación y refuerza la estabilidad en tiempo de ejecución.
  Las clases DTO claramente definidas representan intuitivamente la estructura de entrada esperada para una API, mejorando la legibilidad.

### 3. Validación estructurada y manejo de errores consistente

- **Desafíos del enfoque tradicional**: Cuando la lógica de validación de datos está dispersa entre varios controladores,
  el mantenimiento se vuelve difícil y aplicar una estrategia consistente de manejo de errores se vuelve complejo.
- **Solución de express-cargo**: express-cargo proporciona decoradores de validación integrados y personalizados, lo que permite definir
  reglas de validación declarativamente en clases de solicitud. La validación automática se realiza durante el proceso de enlace de datos
  de la solicitud y, si falla, el manejo de errores personalizable ofrece respuestas consistentes y predecibles.

## ✨ Características principales

- Enlace de solicitudes basado en clases
- Decoradores de validación integrados y personalizados
- Soporte para objetos anidados
- Conversión automática de tipos
- Soporte para campos virtuales y valores calculados
- Manejo de errores personalizable

> Un middleware ligero para Express que habilita enlace de solicitudes y validación basados en clases usando decoradores.

express-cargo ayuda a aliviar la carga de tareas repetitivas, mejorar la calidad y estabilidad del código, y permite que los desarrolladores se concentren en implementar la lógica de negocio principal dentro del entorno de desarrollo Express.js.
Prueba express-cargo para desarrollar aplicaciones Express.js de forma más robusta y eficiente.
