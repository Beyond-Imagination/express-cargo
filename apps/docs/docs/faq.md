---
title: FAQs
sidebar_label: FAQs
---

Find answers to common questions about using the library. Click on a question to reveal the answer.

### 1. Getting Started

<details>
<summary><b>Q: What is the express-cargo project?</b></summary>

**A:** It is a middleware designed to automate repetitive and tedious request data processing (`req.body`, `req.query`, etc.) in Express.js using a class-based approach. By utilizing TypeScript decorators, you can handle data binding and validation declaratively in one place.
</details>

<details>
<summary><b>Q: Are there any precautions for installation?</b></summary>

**A:** **Node.js version 20 or higher** is recommended. It is designed to be flexibly integrated into existing Express projects as standard middleware.
</details>

<details>
<summary><b>Q: Is TypeScript configuration mandatory?</b></summary>

**A:** Yes. Since it uses decorators, the following two options must be set to `true` in your `tsconfig.json`:
- `experimentalDecorators: true`
- `emitDecoratorMetadata: true`

Additionally, importing the `reflect-metadata` package at the entry point of your application is required to read type information at runtime.
</details>

### 2. Data Binding & Decorators

<details>
<summary><b>Q: What is the difference between `@Body` and `@Query`?</b></summary>

**A:** The difference lies in the source of the data extraction:
- **`@Body`**: Extracts data from the HTTP Request body. Mainly used for `POST` and `PUT` requests.
- **`@Query`**: Extracts parameters from the URL query string (e.g., `?id=1&name=test`). Mainly used for filtering or sorting in `GET` requests.
- You can also bind various other request data using `@Params()` (or `@Uri()`), `@Header()`, and `@Session()`.
</details>

<details>
<summary><b>Q: What is @Uri()? Is it different from @Params()?</b></summary>

**A:** `@Uri()` is an **alias** for `@Params()`. You can choose between them based on your readability preference when binding URL path parameters (e.g., `/:id`).
</details>

<details>
<summary><b>Q: How do I retrieve the bound data?</b></summary>

**A:** After passing the `bindingCargo(ClassName)` middleware in your router, you can retrieve the instance inside the handler by calling the `getCargo<ClassName>(req)` function.
</details>

### 3. Validation & Transformation

<details>
<summary><b>Q: How are validation failures handled?</b></summary>

**A:** Validation is performed internally using decorators such as `@Min`, `@Max`, and `@Length`. If invalid data is detected, the middleware automatically returns an error response or throws an exception based on your configuration to block entry into the business logic.
</details>

<details>
<summary><b>Q: How can I process or transform field values?</b></summary>

**A:** Use the **`@Transform()`** decorator. For example, writing `@Transform(v => v.trim())` allows you to transform input data into the desired format before binding.
</details>

<details>
<summary><b>Q: How do I avoid errors if a specific field is missing?</b></summary>

**A:** Use the **`@Optional()`** decorator. The field will be bound successfully even if the value is `null` or `undefined`, skipping validation for that field.
</details>

### 4. Framework Compatibility

<details>
<summary><b>Q: Can I use it with Fastify or NestJS?</b></summary>

**A:** This library is specifically designed as **Express.js-exclusive middleware**.
- **NestJS**: NestJS has its own `ValidationPipe` and decorators, which may overlap in functionality. While technically possible if using the Express adapter, the primary goal of this library is to improve DX in pure Express environments.
- **Fastify**: Currently not officially supported.
</details>

### 5. Troubleshooting

<details>
<summary><b>Q: Why is my class instance data returning `undefined`?</b></summary>

**A:** Please check the following two points:
- Is a body-parsing middleware like `express.json()` declared **before** `bindingCargo`?
- Is `reflect-metadata` imported at the very top of your application's entry point?
</details>

<details>
<summary><b>Q: Does automatic type conversion occur?</b></summary>

**A:** Yes. It attempts to convert values automatically based on the types defined in the class fields (`string`, `number`, `boolean`, etc.). For example, a string `"123"` coming from `@Query()` will be automatically converted to a number if the field type is defined as `number`.
</details>

### 6. Misc

<details>
<summary><b>Q: Can I use it for free in commercial projects?</b></summary>

**A:** This library is licensed under the **MIT License**. You are free to use, modify, and distribute it even for commercial purposes without restrictions.
</details>
